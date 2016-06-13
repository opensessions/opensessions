const express = require('express');

module.exports = (app) => {
  const api = express();

  api.get('/session/:sessionID', (req, res) => {
    res.json({
      id: req.params.sessionID,
      href: req.path,
      title: 'mock title',
      description: 'mock description',
    });
  });

  api.get('/user/:username', (req, res) => {
    res.json({
      username: req.params.username,
      name: 'example name',
    });
  });

  api.get('/user/:username/sessions', (req, res) => {
    res.json([
      {
        title: 'mock title',
        description: 'mock description',
        href: '/api/session/example',
      },
    ]);
  });

  app.use('/api', api);
};
