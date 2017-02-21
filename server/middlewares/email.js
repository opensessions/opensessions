const sendgrid = require('sendgrid');

const { SENDGRID_SECRET, SERVICE_EMAIL, SENDGRID_TEMPLATE, SENDGRID_TRACKING } = process.env;

const emailStyles = {
  messageFrom: { padding: '.5em', background: '#F6F1F1', color: '#666', 'text-align': 'center' },
  messageSrc: { padding: '.8em', background: '#FFF', 'border-bottom': '.15em solid #EEE' },
  button: { 'font-family': 'serif', padding: '.5em', background: '#1B91CD', 'text-align': 'center', margin: '.75em 1em', display: 'block', color: '#FFF', 'text-decoration': 'none', 'font-size': '1.6em' },
  imageCircle: { 'border-radius': '50%', border: '1px solid #CCC', padding: '.5em', width: '80px', height: '80px', 'vertical-align': 'middle', display: 'inline-block' },
  viewLink: { display: 'block', padding: '.75em 1em', background: '#f6f1f1', color: '#777', 'text-decoration': 'underline', 'text-align': 'center' },
  aggregators: { background: '#FFF', padding: '0', margin: '1em auto', 'text-align': 'center' },
  aggregatorsLi: { 'border-bottom': '1px solid #DDD', 'list-style': 'none', margin: '0' },
  aggInfo: { display: 'inline-block', width: '75%', padding: '.5em', 'vertical-align': 'middle', 'text-align': 'left' },
  aggInfoTitle: { 'font-size': '1.2em', 'font-weight': 'bold' },
  aggInfoDesc: { 'font-size': '.9em', 'font-weight': 'bold' },
  aggMeta: { 'list-style': 'none', color: '#777', background: '#f6f1f1', padding: '.5em', margin: '0' },
  aggSrcContainer: { background: '#F6F1F1', 'box-shadow': 'inset 0 2em #FFF', 'text-align': 'center', 'margin-top': '1em', padding: '.5em' },
  aggSrcImg: { 'border-radius': '50%', border: '1px solid #CCC', display: 'inline-block', width: '8em', height: '8em', 'background-color': '#FFF', 'background-position': '50% 50%', 'background-repeat': 'no-repeat', 'background-size': '88%' },
  aggImg: { padding: '.5em', width: '64px', height: '64px', 'vertical-align': 'middle', 'max-width': '100%', 'border-radius': '2em' },
  sessionLink: { 'text-align': 'center', color: '#666' },
  sessionLinkA: { color: '#555' },
  session: { 'text-align': 'center', padding: '0', background: '#FFF', margin: '1em auto' }
};

const getStyledElement = (styleName, html, attrs = {}, tagName = 'div') => {
  const style = Object.assign({}, emailStyles[styleName], attrs.style);
  attrs.style = Object.keys(style).map(key => [key, style[key]].join(': ')).join(';');
  const closeTag = html !== null ? `>${html}</${tagName}` : ' /';
  return `<${tagName} ${Object.keys(attrs).map(key => [key, `"${attrs[key]}"`].join('=')).join(' ')}${closeTag}>`;
};

const sendEmail = (subject, to, body, opts = {}) => {
  const { categories, attachments, substitutions, replyTo, bcc, NO_TEMPLATE } = opts;
  const sg = sendgrid(SENDGRID_SECRET);
  let templateId = opts.template_id || SENDGRID_TEMPLATE;
  if (NO_TEMPLATE) templateId = undefined;
  if (substitutions) substitutions['-contactUs-'] = SERVICE_EMAIL;
  const options = {
    personalizations: [{
      to: [{ email: to }],
      bcc: bcc ? [{ email: bcc }] : null,
      substitutions
    }],
    bcc: bcc ? [{ email: bcc }] : null,
    from: { name: 'Open Sessions', email: SERVICE_EMAIL },
    reply_to: replyTo ? { email: replyTo } : null,
    subject,
    content: [{
      type: 'text/html',
      value: body
    }],
    attachments: attachments || null,
  };
  if (templateId) options.template_id = templateId;
  if (categories && SENDGRID_TRACKING === 'enabled') options.categories = categories;
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: options
  });
  return sg.API(request);
};

module.exports = { sendEmail, getStyledElement };
