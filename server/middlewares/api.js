const express = require('express');
const jwt = require('express-jwt');
const dotenv = require('dotenv');
const fs = require('fs');

const Storage = require('../../storage/interfaces/postgres.js');
const RDPE = require('./rdpe.js');
const s3 = require('./s3.js');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const capitalize = string => `${string[0].toUpperCase()}${string.substr(1)}`;

const getSchema = (model => JSON.parse(JSON.stringify(model.fieldRawAttributesMap, (key, value) => {
  if (key === 'Model') {
    return;
  }
  return value; // eslint-disable-line consistent-return
})));

dotenv.config({ silent: true });
dotenv.load();

module.exports = () => {
  const api = express();
  const storage = new Storage();
  const database = storage.getInstance();
  const getUser = req => (req.user ? req.user.sub : null);

  api.use('/rdpe', RDPE(database, { URL: process.env.SERVICE_LOCATION }));
  api.use('/rdpe-legacy', RDPE(database, { URL: process.env.SERVICE_LOCATION, preserveLatLng: true, baseURL: '/api/rdpe-legacy' }));

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
      res.status(404).json({ error: `Model '${modelName}' does not exist` });
    }
  };

  const queryParse = req => {
    const query = req.query || {};
    if (query) {
      Object.keys(query).filter(key => key[0] === key[0].toUpperCase() && query[key] === 'null').forEach(key => {
        query[key] = null;
      });
    }
    return query;
  };

  api.get('/config.js', (req, res) => {
    const { GOOGLE_MAPS_API_KEY } = process.env;
    const windowKeys = ['GOOGLE_MAPS_API_KEY', 'INTERCOM_APPID', 'AWS_S3_IMAGES_BASEURL'];
    res.send(`
      ${windowKeys.map(key => `window["${key}"] = '${process.env[key]}'`).join(';\n')};

      !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.1.0";
      analytics.load("${process.env.SEGMENT_WRITE_KEY}");
      }}();

      function addScript(src) {
        var script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
      }
      addScript("https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places");
    `);
  });

  api.get('/:model', resolveModel, (req, res) => {
    const { Model } = req;
    requireLogin(req, res, () => {
      const query = Model.getQuery({ where: queryParse(req) }, database.models, getUser(req));
      if (query instanceof Error) {
        res.status(400).json({ status: 'failure', error: query.message });
        return;
      }
      Model.findAll(query).then(instances => {
        res.json({ instances });
      }).catch(error => {
        res.status(404).json({ error: error.message });
      });
    });
  });

  api.all('/:model/create', requireLogin, resolveModel, (req, res) => {
    const { Model } = req;
    const getPrototype = Model.getPrototype || (() => (Promise.resolve({})));
    getPrototype(database.models, getUser(req)).then(data => {
      Object.keys(req.body).forEach(key => {
        data[key] = req.body[key];
      });
      data.owner = getUser(req);
      Model.create(data).then(instance => {
        res.json({ instance });
      }).catch(error => {
        res.status(404).json({ error: error.message });
      });
    });
  });

  api.get('/:model/:uuid', resolveModel, (req, res) => {
    const { Model } = req;
    const { uuid } = req.params;
    requireLogin(req, res, () => {
      const query = Model.getQuery({ where: { uuid } }, database.models, getUser(req));
      if (query instanceof Error) {
        res.status(400).json({ status: 'failure', error: query.message });
        return;
      }
      Model.findOne(query).then(instance => {
        if (instance) {
          res.json({ instance, schema: getSchema(Model) });
        } else {
          throw new Error('Instance could not be retrieved');
        }
      }).catch(error => {
        res.status(404).json({ error: error.message, isLoggedIn: !!req.user });
      });
    });
  });

  api.post('/:model/:uuid', requireLogin, resolveModel, (req, res) => {
    const { Model } = req;
    const { uuid } = req.params;
    const query = Model.getQuery({ where: { uuid } }, database.models, getUser(req));
    if (query instanceof Error) {
      res.status(400).json({ status: 'failure', error: query.message });
      return;
    }
    Model.findOne(query).then(instance => {
      if (instance.owner !== getUser(req)) throw new Error(`Must be owner to modify ${Model.name}`);
      const fields = Object.keys(req.body);
      fields.filter(key => key.slice(-4) === 'Uuid').filter(key => req.body[key] === null).forEach(key => {
        instance[`set${key.replace(/Uuid$/, '')}`](null);
      });
      if (query.include) {
        query.include.forEach(model => {
          delete req.body[model.name];
        });
      }
      return instance.update(req.body, { returning: true }).then(savedInstance => {
        res.json({ instance: savedInstance });
      });
    }).catch(error => {
      res.status(404).json({ error: error.message });
    });
  });

  api.post('/:model/:uuid/:field', requireLogin, resolveModel, upload.single('image'), (req, res) => {
    const { Model } = req;
    const image = req.file;
    const { model, uuid, field } = req.params;
    const aws = {
      URL: process.env.AWS_S3_IMAGES_BASEURL,
      path: `uploads/${model}/${field}/`,
      accessKeyId: process.env.AWS_S3_IMAGES_ACCESSKEY,
      secretAccessKey: process.env.AWS_S3_IMAGES_SECRETKEY
    };
    s3(aws, image.path, uuid)
      .then(result => Model.findOne({ where: { uuid } })
        .then(instance => {
          const data = {};
          data[field] = `https://${aws.URL}/${result.versions[model === 'organizer' ? 0 : 1].key}`;
          [image].concat(result.versions).forEach(version => fs.unlink(version.path));
          return instance.update(data)
            .then(final => res.json({ status: 'success', result, baseURL: aws.URL, instance: final }));
        }).catch(error => res.status(404).json({ error })))
      .catch(error => res.status(400).json({ error }));
  });

  api.get('/:model/:uuid/:action', requireLogin, resolveModel, (req, res) => {
    const { Model } = req;
    const { uuid, action } = req.params;
    const query = Model.getQuery({ where: { uuid, owner: getUser(req) } }, database.models, getUser(req));
    if (query instanceof Error) {
      res.status(400).json({ status: 'failure', error: query.message });
      return;
    }
    if (action === 'delete') {
      Model.findOne(query)
        .then(instance => (instance.setDeleted ? instance.setDeleted() : instance.destroy()))
        .then(() => res.json({ status: 'success' }))
        .catch(error => res.status(404).json({ status: 'failure', error: error.message }));
    } else if (action === 'duplicate') {
      Model.findOne(query)
        .then(base => {
          const data = base.dataValues;
          delete data.uuid;
          data.title = `${data.title} (duplicated)`;
          Model.create(data).then(instance => {
            res.json({ status: 'success', instance });
          }).catch(err => {
            res.status(404).json({ status: 'failure', error: err.message });
          });
        });
    } else {
      res.status(400).json({ status: 'failure', error: `Unrecognized action '${action}'` });
    }
  });

  return api;
};
