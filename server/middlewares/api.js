const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const jwt = require('express-jwt');
const dotenv = require('dotenv');

dotenv.config({ silent: true });
dotenv.load();

module.exports = (app) => {
  const api = express();
  const storage = new Storage();
  const database = storage.getInstance();
  const { Session, Organizer } = database.models;
  const getUser = (req) => (req.user ? req.user.sub : null);

  const requireLogin = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID,
  });

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

  const getSchema = ((model) => JSON.parse(JSON.stringify(model.fieldRawAttributesMap, (key, value) => {
    if (key === 'Model') {
      return;
    }
    return value; // eslint-disable-line consistent-return
  })));

  api.get('/rdpe', (req, res) => {
    res.json({
      sessions: '/api/rdpe/sessions',
    });
  });

  api.get('/rdpe/sessions', (req, res) => {
    const fromTS = req.query.from || 0;
    let afterID = req.query.after;
    if (afterID) {
      afterID = afterID.substring(1, afterID.length - 1); // to convert `{uuid}` into `uuid`
    }
    const where = {
      $or: [
        {
          updatedAt: fromTS,
          uuid: {
            $gt: afterID
          }
        }, {
          updatedAt: {
            $gt: fromTS,
          },
        }
      ],
      state: {
        $in: ['published', 'deleted', 'unpublished']
      }
    };
    const order = [
      ['updatedAt', 'ASC'],
      ['uuid', 'ASC']
    ];
    const limit = 50;
    Session.findAll({ where, order, limit }).then((rawSessions) => {
      const sessions = rawSessions.map((session) => {
        const state = session.state === 'published' ? 'updated' : 'deleted';
        const item = {
          state,
          kind: 'session',
          id: `{${session.uuid}}`,
          modified: session.updatedAt,
        };
        if (state === 'updated') {
          item.data = session;
        }
        return item;
      });
      let next = {
        from: 0,
        after: 0
      };
      if (sessions.length) {
        const lastSession = sessions[sessions.length - 1];
        next.from = lastSession.modified;
        next.after = lastSession.id;
      } else {
        next = req.query;
      }
      res.json({
        items: sessions,
        next: `/api/rdpe/sessions?from=${next.from}&after=${next.after}`
      });
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.get('/session', (req, res) => {
    const where = queryParse(req);
    if ('owner' in where) {
      requireLogin(req, res, () => {
        const user = getUser(req);
        if (where.owner === user) {
          Session.findAll({ where, include: [Organizer] }).then((sessions) => {
            res.json({ instances: sessions });
          }).catch((error) => {
            res.json({ error });
          });
        } else {
          res.json({ error: 'Must be logged in to search by owner' });
        }
      });
    } else {
      where.state = 'published';
      Session.findAll({ where, include: [Organizer] }).then((sessions) => {
        res.json({ instances: sessions });
      }).catch((error) => {
        res.json({ error });
      });
    }
  });

  api.all('/session/create', requireLogin, (req, res) => {
    const session = req.body;
    session.owner = getUser(req);
    Session.create(session).then((savedSession) => {
      res.json(savedSession);
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.get('/session/:uuid', (req, res) => {
    Session.findOne({ where: { uuid: req.params.uuid }, include: [Organizer] }).then((session) => {
      if (session.state === 'draft') {
        requireLogin(req, res, () => {
          const user = getUser(req);
          if (session.owner === user) {
            res.json({ instance: session, schema: getSchema(Session) });
          } else {
            res.json({ error: 'Must be session owner to view draft' });
          }
        });
      } else {
        res.json({ instance: session, schema: getSchema(Session) });
      }
    }).catch((error) => {
      res.json({ error: error.message });
    });
  });

  api.post('/session/:uuid', requireLogin, (req, res) => {
    Session.findOne({ where: { uuid: req.params.uuid } }).then((session) => {
      if (session.owner !== getUser(req)) {
        return res.json({ error: 'Must be session owner to modify session' });
      }
      return session.update(req.body).then((savedSession) => {
        res.json(savedSession);
      }).catch((error) => {
        res.json({ error: error.message });
      });
    }).catch((error) => {
      res.json({ error: error.message });
    });
  });

  api.use('/me', requireLogin);

  api.get('/me', (req, res) => {
    res.json(req.user);
  });

  api.get('/me/sessions', (req, res) => {
    Session.findAll({ where: { owner: getUser(req) } }).then((sessions) => {
      res.json({ sessions });
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.get('/organizer', (req, res) => {
    const query = req.query;
    if (query) {
      if (query.hasOwnProperty('name__contains')) {
        query.name = {
          $like: `%${query.name__contains}%`,
        };
        delete query.name__contains;
      }
    }
    Organizer.findAll({
      where: query,
      include: [Session],
    }).then((organizers) => {
      res.json({ instances: organizers });
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.all('/organizer/create', requireLogin, (req, res) => {
    const organizer = req.body;
    organizer.owner = getUser(req);
    Organizer.create(organizer).then((savedOrganizer) => {
      res.json(savedOrganizer);
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.get('/organizer/:uuid', (req, res) => {
    Organizer.findOne({ where: { uuid: req.params.uuid }, include: [Session] }).then((organizer) => {
      res.json({ instance: organizer });
    }).catch((error) => {
      res.json({ error });
    });
  });

  app.use('/api', api);
};
