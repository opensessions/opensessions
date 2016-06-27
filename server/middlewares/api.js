const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const jwt = require('express-jwt');

module.exports = (app) => {
  const api = express();
  const storage = new Storage();
  const database = storage.getInstance();
  const IDprop = 'sub';

  const requireLogin = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID,
  });

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
    database.models.Session.findAll({ where }).then((rawSessions) => {
      const sessions = rawSessions.map((session) => {
        const state = session.state !== 'deleted' ? 'updated' : 'deleted';
        return {
          state,
          kind: 'session',
          id: session.uuid,
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
    });
  });

  api.all('/session/create', requireLogin, (req, res) => {
    const session = req.body;
    session.owner = req.user[IDprop];
    database.models.Session.create(session).then((savedSession) => {
      res.json(savedSession);
    });
  });

  api.get('/session/:uuid', (req, res) => {
    database.models.Session.findOne({ where: { uuid: req.params.uuid }, include: [database.models.Organizer] }).then((session) => {
      res.json(session);
    });
  });

  api.post('/session/:uuid', requireLogin, (req, res) => {
    database.models.Session.findOne({ where: { uuid: req.params.uuid } }).then((session) => {
      if (session.owner !== req.user[IDprop]) {
        res.json({ error: 'Must be session owner to modify session' });
        return;
      }
      session.update(req.body);
      session.save().then((savedSession) => {
        res.json(savedSession);
      });
    });
  });

  api.use('/me', requireLogin);

  api.get('/me', (req, res) => {
    res.json(req.user);
  });

  api.get('/me/sessions', (req, res) => {
    database.models.Session.findAll({ where: { owner: req.user[IDprop] } }).then((sessions) => {
      res.json(sessions);
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
    database.models.Organizer.findAll({
      where: query,
      include: [database.models.Session],
    }).then((organizers) => {
      res.json(organizers);
    });
  });

  api.all('/organizer/create', requireLogin, (req, res) => {
    const organizer = req.body;
    organizer.owner = req.user[IDprop];
    database.models.Organizer.create(organizer).then((savedOrganizer) => {
      res.json(savedOrganizer);
    });
  });

  api.get('/organizer/:uuid', (req, res) => {
    database.models.Organizer.findOne({ where: { uuid: req.params.uuid }, include: [database.models.Session] }).then((organizer) => {
      res.json(organizer);
    });
  });

  app.use('/api', api);
};
