const dotenv = require('dotenv');

dotenv.config({ silent: true });
dotenv.load();

const config = {};

config.auth0 = {
  CLIENT_DOMAIN: process.env.AUTH0_CLIENT_DOMAIN,
  CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
};

module.exports = config;
