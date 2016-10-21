const express = require('express');
const { sendStoredEmail } = require('./email');

const authenticated = () => false;

const hooks = () => {
  const route = express();

  route.post('/new-user', (req, res) => {
    if (authenticated()) {
      const { to, name } = req.body;
      sendStoredEmail('welcome', to, name).then(() => {
        res.send({ status: 'success' });
      });
    } else {
      res.send({ status: 'fail' });
    }
  });

  return route;
};

module.exports = hooks;
