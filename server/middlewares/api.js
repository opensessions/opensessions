const express = require('express');

module.exports = (app) => {
  const api = express();
  const getSession = req => ({
    id: req.params.sessionID,
    href: '/session/example',
    title: 'mock title',
    description: 'mock description',
  });

  api.get('/session/:sessionID', (req, res) => {
    res.json(getSession(req));
  });

  api.post('/session/:sessionID', (req, res) => {
    req.session.session = JSON.stringify(req.body);
    req.session.save(() => {
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
