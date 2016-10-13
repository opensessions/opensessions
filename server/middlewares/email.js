const sendgrid = require('sendgrid');
const emailCopy = require('./email-copy.json');

const sendEmail = (subject, to, body, files) => {
  const sg = sendgrid(process.env.SENDGRID_SECRET);
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [
        {
          to: [{ email: to }]
        }
      ],
      from: {
        email: 'hello@opensessions.io'
      },
      subject,
      content: [
        {
          type: 'text/html',
          value: body
        }
      ],
      attachments: files || null,
      template_id: '30f00508-77fd-4447-a609-8d8950adfeb7'
    }
  });
  return sg.API(request);
};

const sendStoredEmail = (type, to, name) => {
  const copy = emailCopy[type];
  const body = [`<p>Dear ${name},</p>`, copy.body, '<p>Best,<br />the Open Sessions team</p>'].join('');
  return sendEmail(copy.subject, to, body);
};

module.exports = { sendEmail, sendStoredEmail };
