/* eslint consistent-return:0 */

const express = require('express');
const logger = require('./logger');
const frontend = require('./middlewares/frontend');
const isDev = process.env.NODE_ENV !== 'production';

const dotenv = require('dotenv');
dotenv.config({ silent: true });
dotenv.load();

const passport = require('passport');
const session = require('express-session');

const cookieParser = require('cookie-parser');

const getRenderedPage = require('./lib/server').default;

const app = express();

// Standard node middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static serving
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

// Initialize the database connection
const Storage = require('../storage/interfaces/postgres.js');
const storage = new Storage();
const database = storage.getInstance();

// Initialize the API
const apiMiddleware = require('./middlewares/api');
app.use('/api', apiMiddleware(database));

const { sendEngagementEmails } = require('./middlewares/engagement');
const { CronJob } = require('cron');
const EVERY_SUNDAY_EVE = '0 0 21 * * 0';
const { sendEmail } = require('./middlewares/email');
const emailCron = new CronJob(EVERY_SUNDAY_EVE, () => { // eslint-disable-line no-unused-vars
  sendEngagementEmails(sendEmail, database.models);
}, null, true, process.env.LOCALE_TIMEZONE);

// Initialize frontend middleware that will serve your JS app
const webpackConfig = require(`../internals/webpack/webpack.${isDev ? 'dev' : 'prod'}.babel`);

// Catch bots and serve special rendered components
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

// Webhooks
const hooks = require('./middlewares/hooks');
app.use('/hooks', hooks());

// Webpack frontend (hot reloading etc for dev)
app.use(frontend(webpackConfig));

const port = process.env.PORT || 3850;

app.listen(port, err => {
  if (err) return logger.error(err);

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
