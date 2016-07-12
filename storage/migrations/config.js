const dotenv = require('dotenv');

dotenv.config({ silent: true });
dotenv.load();

const connectDetails = {
  "url": process.env.DATABASE_URL,
  "dialect": "postgres"
};

module.exports = {
  "development": connectDetails
};
