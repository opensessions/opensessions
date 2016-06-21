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
    session.owner = req.user.email;
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
      if (req.user.email !== session.owner) {
        res.json({ error: 'Must be session owner to modify session' });
        return;
      }
      console.log('req.body', req.body);
      session.update(req.body);
      session.save().then((savedSession) => {
        res.json(savedSession);
      });
    });
  });

  api.get('/me', stormpath.loginRequired, (req, res) => {
    res.json(req.user);
  });

  api.get('/me/sessions', stormpath.loginRequired, (req, res) => {
    database.models.Session.findAll({ where: { owner: req.user.email } }).then((sessions) => {
      res.json(sessions);
    });
  });

  app.use('/api', api);
};
