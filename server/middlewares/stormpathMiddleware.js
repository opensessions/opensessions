const stormpath = require('express-stormpath');
const config = require('./../../app/config');

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
  apiKey: {
    id: config.stormpath.APIKEY_ID,
    secret: config.stormpath.APIKEY_SECRET,
  },
  application: {
    href: `https://api.stormpath.com/v1/applications/${config.stormpath.HREF_ID}`,
  },
});
