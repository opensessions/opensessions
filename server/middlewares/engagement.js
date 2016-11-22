/* {
  email: 'oli@imin.co',
  email_verified: true,
  name: 'Oliver Beatson',
  given_name: 'Oliver',
  family_name: 'Beatson',
  picture: 'https://lh5.googleusercontent.com/-aGr61JikdvY/AAAAAAAAAAI/AAAAAAAAAAw/vcvxIHZVlIQ/photo.jpg',
  locale: 'en-GB',
  updated_at: '2016-06-28T11:00:51.488Z',
  user_id: 'google-oauth2|100229880746808785817',
  nickname: 'oli',
  identities: [
    {
      user_id: '100229880746808785817',
      provider: 'google-oauth2',
      connection: 'google-oauth2',
      isSocial: true
    }
  ],
  created_at: '2016-06-24T10:59:33.581Z',
  last_ip: '82.163.127.74',
  last_login: '2016-06-28T11:00:51.488Z',
  logins_count: 12
} */

const { ManagementClient } = require('auth0');
const api = new ManagementClient({
  token: process.env.AUTH0_CLIENT_TOKEN,
  domain: process.env.AUTH0_CLIENT_DOMAIN
});

const sendEngagementEmails = (sendEmail, models) => {
  const now = new Date();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const getExpirations = session => {
    const expiration = {
      future: 0,
      past: {
        week: 0,
        all: 0
      }
    };
    if (session.schedule) {
      session.schedule.forEach(slot => {
        const dayDelta = [now, new Date(slot.startDate)].map(time => Math.floor(time.getTime() / MS_PER_DAY)).reduce((nowDay, slotDay) => nowDay - slotDay);
        if (dayDelta <= 0) {
          expiration.future++;
        } else {
          expiration.past.all++;
          if (!(dayDelta <= 7)) {
            expiration.past.week++;
          }
        }
      });
    }
    return expiration;
  };
  models.Session.findAll().then(allSessions => {
    api.getUsers().then(users => {
      users.forEach(user => {
        const sessions = allSessions.filter(session => session.owner === user.user_id);
        let email = false;
        if (sessions.length) {
          const expirations = sessions.map(getExpirations);
          if (expirations.some(expiration => expiration.past.week && !expiration.future)) {
            email = ['Your sessions have just expired', user.email, `<p>Thanks for being one of the first providers to use the Open Sessions uploader. However, we’ve noticed you’ve been a little inactive lately.</p>
            <p>Login <a href="https://app.opensessions.io/">here</a> and upload more sessions on Open Sessions to ensure they are are visible to thousands of people on Get Active London every month.</p>
            <p>Happy uploading!</p>`, { '-title-': 'Just checking in...' }];
          } else if (expirations.some(expiration => expiration.future)) {
            email = ['Good news from Open Sessions', user.email, `<p>Thanks for being one of the first providers to use the Open Sessions uploader. We wanted to let you know that your session information is live <b>right now</b> on Get Active London!</p>
            <ul>${sessions.map(session => {
              const expiration = getExpirations(session);
              if (expiration.future) {
                return `<li><a href="${session.href}">${session.title}</a></li>`;
              }
              return '';
            }).join('')}</ul>
            <p>If your session information is up to date, please simply reply YES to this email. Otherwise, please login to Open Sessions and update it.</p>
            <p>Happy uploading!</p>`, { '-title-': 'All systems go...' }];
          }
        } else {
          // No sessions made yet
        }
        if (email) {
          sendEmail.apply(sendEmail, email);
        }
      });
    });
  });
};

module.exports = { sendEngagementEmails };
