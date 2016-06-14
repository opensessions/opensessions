const express = require('express');
const session = require('express-session');

module.exports = (app) => {
  const api = express();

  app.use(session({
    secret: 'moose',
    resave: true,
    saveUninitialized: true,
  }));

  getSession = (req) => {
    return {
      id: req.params.sessionID,
      href: '/session/example',
      title: 'mock title',
      description: 'mock description',
    };
  };

  api.get('/session/:sessionID', (req, res) => {
    res.json(getSession(req));
  });

  api.post('/session/:sessionID', (req, res) => {
    req.session.session = JSON.stringify(req.body);
    req.session.save((err) => {
      console.log(req.session, err);
      res.json(getSession(req));
    });
  });

  api.get('/user/:username', (req, res) => {
    res.json({
      username: req.params.username,
      name: 'example name',
    });
  });

  api.get('/user/:username/sessions', (req, res) => {
    res.json([getSession(req)]);
  });

  app.use('/api', api);
};
