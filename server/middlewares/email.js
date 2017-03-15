const sendgrid = require('sendgrid');
const { parseSchedule, nextSchedule } = require('../../utils/calendar');

const { SENDGRID_SECRET, SERVICE_EMAIL, SERVICE_LOCATION, SENDGRID_TEMPLATE, SENDGRID_TRACKING, GOOGLE_MAPS_API_STATICIMAGES_KEY } = process.env;

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
      to: (to instanceof Array ? to : [to]).map(email => ({ email })),
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

function getStaticMapUrl(center, zoom, size, marker) {
  const [lat, lng] = center;
  const opts = {
    center: center.join(','),
    zoom,
    size,
    markers: Object.keys(marker).map(key => [key, marker[key]].join(':')).concat([lat, lng].join(',')).join('%7C'),
    key: GOOGLE_MAPS_API_STATICIMAGES_KEY
  };
  return `https://maps.googleapis.com/maps/api/staticmap?${Object.keys(opts).map(key => [key, opts[key]].join('=')).join('&')}`;
}

const sendPublishedEmail = (session, subject) => {
  const { info, pricing, schedule } = session;
  const nextSlot = nextSchedule(schedule);
  const parsedSlot = nextSlot ? parseSchedule(nextSlot) : false;
  if (!info.contact.email) return Promise.resolve();
  const prices = pricing && pricing.prices ? pricing.prices.map(band => parseFloat(band.price)).sort((a, b) => (a > b ? 1 : -1)) : [0];
  const { lat, lng } = info.location.data;
  return sendEmail(subject, info.contact.email, `
    <p>Dear ${session.contactName || 'Open Sessions user'},</p>
    <p>Great news!</p>
    <p>You have successfully listed your session on Open Sessions.</p>
    ${getStyledElement('session', `
      <h1>${session.title}</h1>
      <table style="text-align:center;">
        <tr class="images">
          <td>${session.image ? `<img src="${session.image}" />` : `<img src="${SERVICE_LOCATION}/images/placeholder.png" />`}</td>
          <td><img src="${getStaticMapUrl([lat, lng], 14, '360x240', { color: 'blue', label: 'S', icon: `${SERVICE_LOCATION}/images/map-pin-active.png` })}" /></td>
        </tr>
        <tr>
          <td style="border-right:1px solid #EEE;">
            <img src="${SERVICE_LOCATION}/images/calendar.png" width="42" height="42" />
            <p class="label">Next session:</p>
            <p>${parsedSlot ? `${parsedSlot.date} <b>at ${parsedSlot.time}</b>` : 'No upcoming session'}</p>
          </td>
          <td style="border-left:1px solid #EEE;padding: 1em 0;">
            <p class="label">Address:</p>
            <p>${info.location.address.split(',').join('<br />')}</p>
            <p class="label">Price:</p>
            <p>from <b>${prices[0] ? `£${prices[0].toFixed(2)}` : '<span class="is-free">FREE</span>'}</b></p>
          </td>
        </tr>
      </table>
      ${getStyledElement('viewLink', 'View or edit your session on Open Sessions', { href: session.absoluteURL }, 'a')}
    `, { class: 'session compact' })}
    <h1>Where does my session appear?</h1>
    ${getStyledElement('aggregators', `
      ${session.aggregators.map(aggregator => getStyledElement('aggregatorsLi', `
        ${getStyledElement('imageCircle', getStyledElement('aggImg', null, { src: aggregator.img }, 'img'), {}, 'span')}
        ${getStyledElement('aggInfo', `
          ${getStyledElement('aggInfoTitle', aggregator.name, {}, 'h2')}
          ${getStyledElement('aggInfoDesc', aggregator.description, {}, 'p')}
          <a href="${aggregator.href}" style="color: inherit;">View your session on ${aggregator.name}</a>
        `)}
      `, { class: 'info' }, 'li')).join('')}
      ${getStyledElement('aggMeta', `Your session ${session.aggregators.length ? `appears on ${session.aggregators.length} activity finder${session.aggregators.length > 1 ? 's' : ''}` : 'doesn\'t appear anywhere yet. We\'ll be in touch'}`, {}, 'li')}
    `, {}, 'ol')}
    <h1>What next?</h1>
    <p>We know that sometimes plans change. If you need to update your listing, click <a href="${session.absoluteURL}/edit">here</a>.</p>
    <p>Why not share your sessions on your social media? Use the social links on your session page.</p>
    <h1>Let us know what we can do better</h1>
    <p>Open Sessions is still in beta testing - your feedback helps us improve it. What would have made things easier for you? Let us know by simply replying to this email.</p>
  `, { substitutions: { '-title-': 'Your session was published!', '-titleClass-': 'large' } });
};

module.exports = { sendEmail, sendPublishedEmail, getStyledElement };
