const stormpath = require('express-stormpath');

module.exports = (app) => {
  return stormpath.init(app, ({
    web: {
      produces: ['application/json'],
    },
    postLoginHandler: (account, req, res, next) => {
      next();
    },
  }));
};
