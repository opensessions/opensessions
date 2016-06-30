const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const jwt = require('express-jwt');
const dotenv = require('dotenv');

dotenv.load();

module.exports = (app) => {
  const api = express();
  const storage = new Storage();
  const database = storage.getInstance();
  const Session = database.models.Session;
  const Organizer = database.models.Organizer;
  const getUser = (req) => req.user.sub;

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

  api.get('/rdpe', (req, res) => {
    res.json({
      sessions: '/api/rdpe/sessions',
    });
  });

  api.get('/rdpe/sessions', (req, res) => {
    const fromTS = req.query.from || 0;
    const where = {
      updatedAt: {
        $gte: fromTS,
      },
    };
    const order = [
      ['updatedAt', 'DESC']
    ];
    const limit = 50;
    Session.findAll({ where, order, limit }).then((rawSessions) => {
      const sessions = rawSessions.map((session) => {
        const state = session.state !== 'deleted' ? 'updated' : 'deleted';
        return {
          state,
          kind: 'session',
          id: `{${session.uuid}}`,
          modified: session.updatedAt,
          data: session,
        };
      });
      const next = {
        from: sessions.length ? sessions[sessions.length - 1].modified : 0,
        after: sessions.length ? sessions[sessions.length - 1].id : 0,
      };
      res.json({
        items: sessions,
        next: `/api/rdpe/sessions?from=${next.from}&after=${next.after}`
      });
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.get('/session', (req, res) => {
    Session.findAll({ where: queryParse(req), include: [Organizer] }).then((sessions) => {
      res.json(sessions);
    }).catch((error) => {
      res.json({ error });
    });
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
      res.json(session);
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.post('/session/:uuid', requireLogin, (req, res) => {
    Session.findOne({ where: { uuid: req.params.uuid } }).then((session) => {
      if (session.owner !== getUser(req)) {
        res.json({ error: 'Must be session owner to modify session' });
        return;
      }
      session.update(req.body);
      session.save().then((savedSession) => {
        res.json(savedSession);
      });
    }).catch((error) => {
      res.json({ error });
    });
  });

  api.use('/me', requireLogin);

  api.get('/me', (req, res) => {
    res.json(req.user);
  });

  api.get('/me/sessions', (req, res) => {
    Session.findAll({ where: { owner: getUser(req) } }).then((sessions) => {
      res.json(sessions);
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
      res.json(organizers);
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
      res.json(organizer);
    }).catch((error) => {
      res.json({ error });
    });
  });

  app.use('/api', api);
};
