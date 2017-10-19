/* eslint consistent-return:0 */

const express = require('express');
const logger = require('./logger');
const Raven = require('raven');
const frontend = require('./middlewares/frontend');
const isDev = process.env.NODE_ENV !== 'production';

require('dotenv').config({ verbose: false });

const passport = require('passport');
const session = require('express-session');

const cookieParser = require('cookie-parser');

const getRenderedPage = require('./lib/server').default;

Raven.config(process.env.SENTRY_DSN).install();

const app = express();

// Logging middleware
app.use(Raven.requestHandler());

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

const { CronJob } = require('cron');
const { sendWeeklyEmails, sendDailyEmails } = require('./middlewares/engagement');
const { makeAppAnalysis } = require('./middlewares/analysis');
const { runDatabaseCleanup } = require('./maintenance');

const EVERY_MONDAY_MORNING = '0 0 7 * * 1';
const EVERY_MORNING = '0 0 8 * * *';
const EVERY_NIGHT = '0 0 0 * * *';

const crons = [
  new CronJob(EVERY_MONDAY_MORNING, () => {
    sendWeeklyEmails(database.models);
  }, null, true, process.env.LOCALE_TIMEZONE),
  new CronJob(EVERY_MORNING, () => {
    sendDailyEmails(database.models);
    makeAppAnalysis(database.models, { trigger: 'daily-cron' });
  }, null, true, process.env.LOCALE_TIMEZONE),
  new CronJob(EVERY_NIGHT, () => {
    runDatabaseCleanup(database);
  }, null, true, process.env.LOCALE_TIMEZONE)
];

console.log('Crons started', crons);

makeAppAnalysis(database.models, { trigger: 'app-started' });

// Initialize frontend middleware that will serve your JS app
const webpackConfig = require(`../internals/webpack/webpack.${isDev ? 'dev' : 'prod'}.babel`);

const isCrawler = /bot|googlebot|facebookexternalhit|twitterbot|crawler|spider|robot|crawling/i;

// Catch bots and serve special rendered components
app.use((req, res, done) => {
  if ((req.query && req.query.ssr) || isCrawler.test(req.get('User-Agent'))) {
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

app.use('/hooks', hooks(database));

// Webpack frontend (hot reloading etc for dev)
if (process.argv.indexOf('NO_WEBPACK') === -1) app.use(frontend(webpackConfig));

app.use(Raven.errorHandler());




class ApiError {
  constructor({statusCode, rawError}) {
    super('ApiError', {statusCode, responseData})
  }
}

const defaultHandlerError = (err, req, res, next) => {
  console.log('ERROR MIDDLE\n\n\n');
  if (err instanceof Error) {
    const errorMessage = `ERROR serving ${req.originalUrl}:\n\tname: ${error.name}\n\tmessage: ${error.message}\n\tstack: ${error.stack}`);
    logger.error(err);

  }
  // res.status(500).json({ status: 'failure', error });
  // res.status(500).json({ status: 'failure', error: 'Invalid email address' });
  // res.status(400).json({ message: 'Failed to load emails', error: err, content: err ? err.message : '' });
  // res.status(400).json({ status: 'failure', error: query.message });
  // res.status(404).json({ error: error.message });
  // res.status(400).json(result.raw ? result : { error: result.message });
  // res.status(401).json({ error: `Permission denied to create ${req.params.model}` });
  // res.status(404).json({ error: error.message });
}
app.use(defaultHandlerError);
app.use((req, res, next) => {
  console.log('MIDDLE\n\n\n');
  next()
})










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
