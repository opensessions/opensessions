const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const jwt = require('express-jwt');
const dotenv = require('dotenv');
const RDPE = require('./rdpe.js');

const capitalize = (string) => `${string[0].toUpperCase()}${string.substr(1)}`;

const getSchema = ((model) => JSON.parse(JSON.stringify(model.fieldRawAttributesMap, (key, value) => {
  if (key === 'Model') {
    return;
  }
  return value; // eslint-disable-line consistent-return
})));

dotenv.config({ silent: true });
dotenv.load();

module.exports = (app) => {
  const api = express();
  const storage = new Storage();
  const database = storage.getInstance();
  const getUser = req => (req.user ? req.user.sub : null);

  const rdpe = RDPE(app, database);
  api.use('/rdpe', rdpe);

  const requireLogin = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID,
  });

  const resolveModel = (req, res, next) => {
    const modelName = capitalize(req.params.model);
    if (modelName in database.models) {
      req.Model = database.models[modelName];
      next();
    } else {
      res.json({ error: `Model '${modelName}' does not exist` });
    }
  };

  const queryParse = (req) => {
    const query = req.query || {};
    if (query) {
      Object.keys(query).forEach((key) => {
        if (key[0] === key[0].toUpperCase()) {
          if (query[key] === 'null') {
            query[key] = null;
          }
        }
      });
    }
    return query;
  };

  api.get('/keys', (req, res) => {
    const { GOOGLE_MAPS_API_KEY, GOOGLE_ANALYTICS_TRACKINGID } = process.env;
    res.json({
      GOOGLE_MAPS_API_KEY,
      GOOGLE_ANALYTICS_TRACKINGID
    });
  });

  api.get('/config.js', (req, res) => {
    const { GOOGLE_MAPS_API_KEY, GOOGLE_ANALYTICS_TRACKINGID } = process.env;
    const windowKeys = ['GOOGLE_MAPS_API_KEY', 'GOOGLE_ANALYTICS_TRACKINGID', 'INTERCOM_APPID'];
    res.send(`
      ${windowKeys.map((key) => `window["${key}"] = '${process.env[key]}'`).join(';\n')};

      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', '${GOOGLE_ANALYTICS_TRACKINGID}', 'auto');
      ga('send', 'pageview');

      var maps = document.createElement('script');
      maps.src = "https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places";
      document.head.appendChild(maps);
    `);
  });

  api.get('/:model', resolveModel, (req, res) => {
    const { Model } = req;
    requireLogin(req, res, () => {
      const query = Model.getQuery({ where: queryParse(req) }, database.models, req.user);
      if (Model.name === 'Session') {
        if ('owner' in query.where) {
          if (query.where.owner !== getUser(req)) {
            res.json({ error: 'Must be logged in to search by owner' });
          }
        } else {
          query.where.state = 'published';
        }
      }
      Model.findAll(query).then((instances) => {
        res.json({ instances });
      }).catch((error) => {
        res.json({ error: error.message });
      });
    });
  });

  api.all('/:model/create', requireLogin, resolveModel, (req, res) => {
    const { Model } = req;
    const data = req.body;
    data.owner = getUser(req);
    Model.create(data).then((instance) => {
      res.json({ instance });
    }).catch((error) => {
      res.json({ error: error.message });
    });
  });

  api.get('/:model/:uuid', resolveModel, (req, res) => {
    const { Model } = req;
    const { uuid } = req.params;
    requireLogin(req, res, () => {
      const query = Model.getQuery({ where: { uuid } }, database.models, req.user);
      Model.findOne(query).then((instance) => {
        if (instance) {
          res.json({ instance, schema: getSchema(Model) });
        } else {
          throw new Error('Instance could not be retrieved');
        }
      }).catch((error) => {
        res.json({ error: error.message, isLoggedIn: !!req.user });
      });
    });
  });

  api.post('/:model/:uuid', requireLogin, resolveModel, (req, res) => {
    const { Model } = req;
    Model.findOne({ where: { uuid: req.params.uuid } }).then((instance) => {
      if (instance.owner !== getUser(req)) throw new Error(`Must be owner to modify ${Model.name}`);
      const fields = Object.keys(req.body);
      fields.filter((key) => key.slice(-4) === 'Uuid').forEach((key) => {
        if (req.body[key] === null) {
          instance[`set${key.substr(0, key.length - 4)}`](null);
        }
      });
      return instance.update(req.body, { fields, returning: true }).then((savedInstance) => {
        res.json({ instance: savedInstance });
      });
    }).catch((error) => {
      res.json({ error: error.message });
    });
  });

  api.get('/:model/:uuid/:action', requireLogin, resolveModel, (req, res) => {
    const { Model } = req;
    const { uuid, action } = req.params;
    if (action === 'delete') {
      const query = Model.getQuery({ where: { uuid, owner: getUser(req) } }, database.models, req.user);
      Model.findOne(query)
        .then((instance) => (instance.setDeleted ? instance.setDeleted() : instance.destroy()))
        .then(() => res.json({ status: 'success' }))
        .catch((error) => res.json({ status: 'failure', error: error.message }));
    }
  });

  app.use('/api', api);
};
