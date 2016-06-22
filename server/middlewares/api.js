const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const stormpath = require('express-stormpath');

module.exports = (app) => {
  const api = express();
  const doDBInstall = true;
  const storage = new Storage(doDBInstall);
  const database = storage.getInstance();

  api.all('/session/create', stormpath.loginRequired, (req, res) => {
    const session = req.body;
    session.owner = req.user.username;
    database.models.Session.create(session).then((savedSession) => {
      res.json(savedSession);
    });
  });

  api.get('/session/:uuid', (req, res) => {
    database.models.Session.findOne({ where: { uuid: req.params.uuid } }).then((session) => {
      res.json(session);
    });
  });

  api.post('/session/:uuid', stormpath.loginRequired, (req, res) => {
    database.models.Session.findOne({ where: { uuid: req.params.uuid } }).then((session) => {
      if (session.owner !== req.user.username) {
        res.json({ error: 'Must be session owner to modify session' });
        return;
      }
      database.models.Organizer.create({ owner: req.user.username, name: req.body.organizer }).then((organizer) => {
        session.update(req.body);
        session.OrganizerUuid = organizer.uuid;
        session.save().then((savedSession) => {
          res.json(savedSession);
        });
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
    database.models.Organizer.findAll({ where: req.query }).then((organizers) => {
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
    database.models.Organizer.findOne({ where: { uuid: req.params.uuid } }).then((organizer) => {
      res.json(organizer);
    });
  });

  api.get('/organizer/:uuid/sessions', (req, res) => {
    database.models.Organizer.findOne({ where: { uuid: req.params.uuid } }).then((organizer) => {
      database.models.Session.findAll({ where: { OrganizerUuid: organizer.uuid } }).then((sessions) => {
        res.json({ organizer, sessions });
      });
    });
  });

  app.use('/api', api);
};
