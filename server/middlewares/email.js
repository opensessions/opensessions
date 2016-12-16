const sendgrid = require('sendgrid');
const emailCopy = require('./email-copy.json');

const { SENDGRID_SECRET, SERVICE_EMAIL, SENDGRID_TEMPLATE } = process.env;

const sendEmail = (subject, to, body, opts) => {
  opts = opts || {};
  const { categories, attachments, substitutions, replyTo, bcc, NO_TEMPLATE } = opts;
  const sg = sendgrid(SENDGRID_SECRET);
  let templateId = opts.template_id || SENDGRID_TEMPLATE;
  if (NO_TEMPLATE) templateId = null;
  console.log(`sendEmail(${subject}, ${to}, body, ${JSON.stringify(opts)})`);
  const options = {
    personalizations: [{
      to: [{ email: to }],
      bcc: bcc ? [{ email: bcc }] : null,
      substitutions
    }],
    bcc: bcc ? [{ email: bcc }] : null,
    from: {
      email: SERVICE_EMAIL
    },
    reply_to: replyTo ? { email: replyTo } : null,
    subject,
    content: [{
      type: 'text/html',
      value: body
    }],
    attachments: attachments || null,
    template_id: templateId
  };
  if (categories) options.categories = categories;
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: options
  });
  return sg.API(request);
};

const sendStoredEmail = (type, to, name) => {
  const copy = emailCopy[type];
  const { subject, title } = copy;
  const body = [`<p>Dear ${name},</p>`, copy.body].join('');
  return sendEmail(subject, to, body, { substitutions: { '-title-': title } });
};

module.exports = { sendEmail, sendStoredEmail };
