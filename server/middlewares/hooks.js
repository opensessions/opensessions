const express = require('express');
const { sendEmail } = require('./email');
const jwt = require('express-jwt');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const requireLogin = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID,
});

const emailsRoute = (models) => {
  const route = express();
  const { SERVICE_EMAIL, EMAILS_INBOUND_URL } = process.env;

  route.post('/inbound', upload.none(), (req, res) => {
    const { body } = req;
    const [uuid] = body.to.split('@');
    const { html, subject } = body;
    const bodyFrom = body.from;
    models.Threads.findOne({ where: { uuid } }).then(thread => {
      const { originEmail, metadata } = thread;
      return models.Session.findOne({ where: { uuid: metadata.SessionUuid } }).then(session => {
        const { contactEmail } = session;
        console.log(':: :: retrieved Thread + Session ::', originEmail, metadata, contactEmail, session.title);
        return sendEmail(subject, bodyFrom.indexOf(originEmail) === -1 ? originEmail : contactEmail, html, { bcc: SERVICE_EMAIL, replyTo: [thread.uuid, EMAILS_INBOUND_URL].join('@'), NO_TEMPLATE: true }).then(() => res.send('OK'));
      });
    }).catch(error => {
      console.error(error);
      res.status(400).send('REQUEST FAILED');
    });
  });

  return route;
};

const hooks = (database) => {
  const route = express();
  const { SERVICE_LOCATION, SERVICE_EMAIL } = process.env;

  route.use('/emails', emailsRoute(database.models));

  route.post('/feature', requireLogin, (req, res) => {
    const { feature, name, email } = req.body;
    sendEmail('A user is interested in a feature', SERVICE_EMAIL, `
      <p>The user ${name} &lt;${email}&gt; is interested in the '${feature}' feature. Please let them know when it's ready!</p>
    `, { substitutions: { '-title-': 'Feature request' } }).then(() => {
      res.json({ status: 'success' });
    });
  });

  route.post('/feature-dialog', requireLogin, (req, res) => {
    const { feature, name, email } = req.body;
    sendEmail('A user has opened a feature dialog', SERVICE_EMAIL, `
      <p>A user (${name} &lt;${email}&gt;) has opened a dialog box for the '${feature}' feature on ${SERVICE_LOCATION}.</p>
    `, { substitutions: { '-title-': 'Dialog box opened' } }).then(() => {
      res.json({ status: 'success' });
    });
  });

  return route;
};

module.exports = hooks;
