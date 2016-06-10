const stormpath = require('express-stormpath');

module.exports = (app) => stormpath.init(app, {
  web: {
    produces: ['application/json'],
  },
});
