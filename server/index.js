/* eslint consistent-return:0 */

const express = require('express');
const logger = require('./logger');

const frontend = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';

const passport = require('passport');
const session = require('express-session');

const cookieParser = require('cookie-parser');

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

app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  (req, res) => {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect('/user');
  }
);

// Initialize api
const apiMiddleware = require('./middlewares/api');
apiMiddleware(app);

// Initialize frontend middleware that will serve your JS app
const webpackConfig = isDev
  ? require('../internals/webpack/webpack.dev.babel')
  : require('../internals/webpack/webpack.prod.babel');
app.use(frontend(webpackConfig));

const port = process.env.PORT || 3000;

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
});
