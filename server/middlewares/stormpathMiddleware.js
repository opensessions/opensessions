const stormpath = require('express-stormpath');

module.exports = (app) => stormpath.init(app, {
  web: {
    produces: ['application/json'],
    register: {
      enabled: true,
      form: {
        fields: {
          givenName: {
            enabled: false,
          },
          surname: {
            enabled: false,
          },
          email: {
            enabled: true,
          },
        },
      },
    },
    login: {
      enabled: true,
      form: {
        fields: {
          username: {
            enabled: false,
          },
          email: {
            enabled: true,
            required: true,
          },
        },
      },
    },
  },
});
