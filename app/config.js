const dotenv = require('dotenv');

dotenv.load();

const config = {};

config.stormpath = {
  APIKEY_ID: process.env.STORMPATH_API_KEY_ID,
  APIKEY_SECRET: process.env.STORMPATH_API_KEY_SECRET,
  HREF: process.env.STORMPATH_URL,
};

config.auth0 = {
  CLIENT_DOMAIN: process.env.AUTH0_CLIENT_DOMAIN,
  CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
};

module.exports = config;
