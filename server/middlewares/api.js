const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const jwt = require('express-jwt');
const cors = require('cors');

module.exports = (app) => {
  const api = express();
  const storage = new Storage();
  const database = storage.getInstance();
  const IDprop = 'sub';

  api.use(cors());

  const requireLogin = jwt({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID,
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

  api.get('/me', requireLogin, (req, res) => {
    res.json(req.user);
  });

  api.get('/me/sessions', requireLogin, (req, res) => {
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
