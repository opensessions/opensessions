const dotenv = require('dotenv');

dotenv.load();

const config = {};

config.stormpath = {
  APIKEY_ID: process.env.STORMPATH_CLIENT_APIKEY_ID,
  APIKEY_SECRET: process.env.STORMPATH_CLIENT_APIKEY_SECRET,
  HREF_ID: process.env.STORMPATH_APPLICATION_HREF_ID,
};

module.exports = config;
