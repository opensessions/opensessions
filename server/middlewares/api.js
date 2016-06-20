const express = require('express');
const Storage = require('../../storage/interfaces/postgres.js');
const stormpath = require('express-stormpath');

module.exports = (app) => {
  const api = express();
  const getMockSession = req => ({
    id: req.params.sessionID,
    href: '/session/example',
    title: 'mock title',
    description: 'mock description',
  });

  const storage = new Storage();
  const database = storage.getInstance();

  api.all('/session/create', stormpath.loginRequired, (req, res) => {
    const session = req.body;
    console.log('create attempt ## ', req.user);
    session.owner = req.user.email;
    database.models.Session.create(session).then((session) => {
      res.json(session);
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
        res.json({error: 'Must be session owner to modify session'});
        return;
      }
      session.update(req.body);
      session.save().then((session) => {
        res.json(session);
      });
    });
  });

  api.get('/user/:username', (req, res) => {
    res.json({
      username: req.params.username,
      name: 'example name',
    });
  });

  api.get('/user/:username/sessions', stormpath.loginRequired, (req, res) => {
    database.models.Session.findAll({ where: { owner: req.user.email } }).then((sessions) => {
      res.json(sessions);
    });
  });

  app.use('/api', api);
};
