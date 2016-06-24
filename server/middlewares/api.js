const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const stormpath = require('express-stormpath');

module.exports = (app) => {
  const api = express();
  const storage = new Storage();
  const database = storage.getInstance();

  api.all('/session/create', stormpath.loginRequired, (req, res) => {
    const session = req.body;
    session.owner = req.user.username;
    database.models.Session.create(session).then((savedSession) => {
      res.json(savedSession);
    });
  });

  api.get('/session/:uuid', (req, res) => {
    database.models.Session.findOne({ where: { uuid: req.params.uuid }, include: [database.models.Organizer] }).then((session) => {
      res.json(session);
    });
  });

  api.post('/session/:uuid', stormpath.loginRequired, (req, res) => {
    database.models.Session.findOne({ where: { uuid: req.params.uuid } }).then((session) => {
      if (session.owner !== req.user.username) {
        res.json({ error: 'Must be session owner to modify session' });
        return;
      }
      session.update(req.body);
      session.OrganizerUuid = req.body.organizer;
      session.save().then((savedSession) => {
        res.json(savedSession);
      });
    });
  });

  api.get('/me', stormpath.loginRequired, (req, res) => {
    res.json(req.user);
  });

  api.get('/me/sessions', stormpath.loginRequired, (req, res) => {
    database.models.Session.findAll({ where: { owner: req.user.username } }).then((sessions) => {
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

  api.all('/organizer/create', stormpath.loginRequired, (req, res) => {
    const organizer = req.body;
    organizer.owner = req.user.username;
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
