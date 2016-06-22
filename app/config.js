const dotenv = require('dotenv');

dotenv.load();

const config = {};

config.stormpath = {
  APIKEY_ID: process.env.STORMPATH_API_KEY_ID,
  APIKEY_SECRET: process.env.STORMPATH_API_KEY_SECRET,
  HREF: process.env.STORMPATH_URL,
};

module.exports = config;
