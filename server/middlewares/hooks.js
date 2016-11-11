const express = require('express');
const { sendEmail } = require('./email');
const jwt = require('express-jwt');

const requireLogin = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID,
});

const hooks = () => {
  const route = express();

  route.post('/feature', requireLogin, (req, res) => {
    const { feature, name, email } = req.body;
    const EMAIL = 'hello@opensessions.io';
    sendEmail('A user is interested in a feature', EMAIL, `
      <p>The user ${name} &lt;${email}&gt; is interested in the '${feature}' feature. Please let them know when it's ready!</p>
    `, { '-title-': 'Feature request' }).then(() => {
      res.json({ status: 'success' });
    });
  });

  return route;
};

module.exports = hooks;
