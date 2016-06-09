const stormpath = require('express-stormpath');

module.exports = () => {
  return stormpath.init(app, {
    web: {
      produces: ['application/json'],
    },
    postLoginHandler: function (account, req, res, next) {
      res.cookie('accountHref', account.href, { maxAge: 7*24*60*60, httpOnly: true });
      next();
    },
  })
};
