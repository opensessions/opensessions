const sendgrid = require('sendgrid');
const emailCopy = require('./email-copy.json');

const sendEmail = (subject, to, body, substitutions, files) => {
  const sg = sendgrid(process.env.SENDGRID_SECRET);
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{
        to: [{ email: to }],
        substitutions
      }],
      from: {
        email: 'hello@opensessions.io'
      },
      subject,
      content: [{
        type: 'text/html',
        value: body
      }],
      attachments: files || null,
      template_id: '30f00508-77fd-4447-a609-8d8950adfeb7'
    }
  });
  return sg.API(request);
};

const sendStoredEmail = (type, to, name) => {
  const copy = emailCopy[type];
  const { subject, title } = copy;
  const body = [`<p>Dear ${name},</p>`, copy.body].join('');
  return sendEmail(subject, to, body, {
    '-title-': title
  });
};

module.exports = { sendEmail, sendStoredEmail };
