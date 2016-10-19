/* eslint consistent-return:0 */

const express = require('express');
const logger = require('./logger');
// const { sendStoredEmail } = require('./middlewares/email');

const dotenv = require('dotenv');
dotenv.config({ silent: true });
dotenv.load();

const frontend = require('./middlewares/frontend');
const isDev = process.env.NODE_ENV !== 'production';

const passport = require('passport');
const session = require('express-session');

const cookieParser = require('cookie-parser');

const getRenderedPage = require('./lib/server').default;

const app = express();

// API middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize static serving
app.use('/images', express.static('app/images'));
app.use('/favicon.ico', express.static('app/favicon.ico'));

// Initialise Auth0, Passport and express-session
app.use(cookieParser());
app.use(session({
  secret: 'randomstring',
  resave: false,
  saveUnitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize api
const apiMiddleware = require('./middlewares/api');
app.use('/api', apiMiddleware());

// Initialize frontend middleware that will serve your JS app
const webpackConfig = require(`../internals/webpack/webpack.${isDev ? 'dev' : 'prod'}.babel`);

app.use((req, res, done) => {
  if ((req.query && req.query.ssr) || req.get('User-Agent').match(/bot|googlebot|facebookexternalhit|crawler|spider|robot|crawling/i)) {
    getRenderedPage(req).then(page => {
      res.send(page);
    }).catch(error => {
      console.error(error);
      res.json({ status: 'error', error });
    });
  } else {
    done();
  }
});
app.use(frontend(webpackConfig));

const port = process.env.PORT || 3850;

app.listen(port, (err) => {
  if (err) {
    return logger.error(err);
  }

  // Connect to ngrok in dev mode
  if (isDev) {
    const ngrok = require('ngrok'); // eslint-disable-line global-require
    ngrok.connect(port, (innerErr, url) => {
      if (innerErr) {
        return logger.error(innerErr);
      }
      logger.appStarted(port, url);
    });
  } else {
    logger.appStarted(port);
  }

  // sendStoredEmail('welcome', 'oli@imin.co', 'oli').then(console.log).catch(console.log);
});
