const passport = require('passport');
const auth0strategy = require('passport-auth0');
const config = require('./../../app/config');

const strategy = new auth0strategy({
  domain: 'opensessions.eu.auth0.com',
  clientID: config.auth0.CLIENT_ID,
  clientSecret: config.auth0.CLIENT_SECRET,
  callbackURL: '/callback',
}, (accessToken, refreshToken, extraParams, profile, done) => {
  return done(null, profile);
});

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = strategy;
