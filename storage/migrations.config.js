require('dotenv').config({ silent: true });

const connectDetails = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres'
};

module.exports = {
  development: connectDetails,
  production: connectDetails
};
