const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const config = require('./../../app/config');

const strategy = new Auth0Strategy({
  domain: 'opensessions.eu.auth0.com',
  clientID: config.auth0.CLIENT_ID,
  clientSecret: config.auth0.CLIENT_SECRET,
  callbackURL: '/callback',
}, (accessToken, refreshToken, extraParams, profile, done) => done(null, profile));

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = strategy;
