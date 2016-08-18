const express = require('express');
const jwt = require('express-jwt');
const dotenv = require('dotenv');

const Storage = require('../../storage/interfaces/postgres.js');
const RDPE = require('./rdpe.js');
const s3 = require('./s3.js');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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

  api.get('/config.js', (req, res) => {
    const { GOOGLE_MAPS_API_KEY, GOOGLE_ANALYTICS_TRACKINGID } = process.env;
    const windowKeys = ['GOOGLE_MAPS_API_KEY', 'GOOGLE_ANALYTICS_TRACKINGID', 'INTERCOM_APPID', 'AWS_S3_IMAGES_BASEURL'];
    res.send(`
      ${windowKeys.map((key) => `window["${key}"] = '${process.env[key]}'`).join(';\n')};

      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      ga('create', '${GOOGLE_ANALYTICS_TRACKINGID}', 'auto');
      ga('send', 'pageview');

      window['_fs_debug'] = false;
      window['_fs_host'] = 'www.fullstory.com';
      window['_fs_org'] = '${process.env.FULLSTORY_ORG}';
      window['_fs_namespace'] = 'FS';
      (function(m,n,e,t,l,o,g,y){
        if (e in m && m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].'); return;}
        g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
        o=n.createElement(t);o.async=1;o.src='https://'+_fs_host+'/s/fs.js';
        y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
        g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){g(l,v)};
        g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
        g.clearUserCookie=function(c,d,i){if(!c || document.cookie.match('fs_uid=[^;\`]*\`[^;\`]*\`[^;\`]*\`')){
        d=n.domain;while(1){n.cookie='fs_uid=;domain='+d+
        ';path=/;expires='+new Date(0);i=d.indexOf('.');if(i<0)break;d=d.slice(i+1)}}};
      })(window,document,window['_fs_namespace'],'script','user');

      window.__insp = window.__insp || [];
      __insp.push(['wid', ${process.env.INSPECTLET_WID}]);
      (function() {
      function ldinsp(){if(typeof window.__inspld != "undefined") return; window.__inspld = 1; var insp = document.createElement('script'); insp.type = 'text/javascript'; insp.async = true; insp.id = "inspsync"; insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(insp, x); };
      setTimeout(ldinsp, 500); document.readyState != "complete" ? (window.attachEvent ? window.attachEvent('onload', ldinsp) : window.addEventListener('load', ldinsp, false)) : ldinsp();
      })();

      var maps = document.createElement('script');
      maps.src = "https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places";
      document.head.appendChild(maps);
    `);
  });

  api.post('/session-image/:uuid', upload.single('image'), (req, res) => {
    const image = req.file;
    const { uuid } = req.params;
    const { Session } = database.models;
    const aws = {
      URL: process.env.AWS_S3_IMAGES_BASEURL,
      path: 'uploads/',
      accessKeyId: process.env.AWS_S3_IMAGES_ACCESSKEY,
      secretAccessKey: process.env.AWS_S3_IMAGES_SECRETKEY
    };
    s3(aws, image.path, uuid).then(result => {
      Session.findOne({ where: { uuid } }).then(instance => {
        const { versions } = result;
        return instance.update({ image: `https://${aws.URL}/${versions[1].key}` }).then(final => {
          res.json({ status: 'success', result, baseURL: aws.URL, instance: final });
        });
      }).catch(error => {
        res.status(404).json({ error });
      });
    }).catch(error => {
      res.status(400).json({ error });
    });
  });

  api.get('/:model', resolveModel, (req, res) => {
    const { Model } = req;
    requireLogin(req, res, () => {
      const query = Model.getQuery({ where: queryParse(req) }, database.models, getUser(req));
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
      const query = Model.getQuery({ where: { uuid } }, database.models, getUser(req));
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
      const query = Model.getQuery({ where: { uuid, owner: getUser(req) } }, database.models, getUser(req));
      Model.findOne(query)
        .then((instance) => (instance.setDeleted ? instance.setDeleted() : instance.destroy()))
        .then(() => res.json({ status: 'success' }))
        .catch((error) => res.json({ status: 'failure', error: error.message }));
    }
  });

  app.use('/api', api);
};
