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
  identities: [{
    user_id: '100229880746808785817',
    provider: 'google-oauth2',
    connection: 'google-oauth2',
    isSocial: true
  }],
  created_at: '2016-06-24T10:59:33.581Z',
  last_ip: '82.163.127.74',
  last_login: '2016-06-28T11:00:51.488Z',
  logins_count: 12
} */

const { SERVICE_LOCATION, SERVICE_EMAIL } = process.env;

const { getAllUsers } = require('../../storage/users');
const { sendEmail } = require('./email');

const sessionHref = session => `${SERVICE_LOCATION}${session.href}`;

const sendFinishListingEmails = (models) => {
  models.Session.findAll({ state: 'draft' }).then(drafts => {
    getAllUsers().then(users => {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      const yesterdayDateString = now.toDateString();
      const yesterdayDrafts = drafts.filter(draft => (new Date(draft.createdAt)).toDateString() === yesterdayDateString);
      yesterdayDrafts.forEach(draft => {
        const user = users.find(u => u.user_id === draft.owner);
        sendEmail('Finish your Open Sessions listing', user.email, `<p>Dear ${user.nickname || user.name},</p>
          <p>Congratulations on starting your listing ${draft.title ? `'${draft.title}'` : 'on Open Sessions'}.</p>
          <p>You're just a few steps away from getting the word out about your session.</p>
          <p><a class="button" href="${sessionHref(draft)}/edit">Finish your listing</a></p>
          <h2>Why use Open Sessions?</h2>
          <p>Open Sessions is the easy way to get the sessions you run discovered by the thousands of people across the country searching for physical activity via the web's activity finders.</p>
          <p><a href="${sessionHref(draft)}/edit">Complete your session listing</a> and publish it to start letting people know about the great sessions you run.</p>
        `, { substitutions: { '-title-': 'You\'re nearly there', '-titleClass-': 'large' }, categories: ['engagement', 'engagement-finishlisting'] });
      });
    });
  });
};

const sendEngagementEmails = (models) => {
  const outbox = [];
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
  models.Session.findAll({ state: { $not: 'deleted' } }).then(allSessions => {
    getAllUsers().then(users => {
      users.forEach(user => {
        const sessions = allSessions.filter(session => session.owner === user.user_id);
        const analysis = {
          sessions: {
            published: sessions.filter(session => session.state === 'published'),
            drafts: sessions.filter(session => session.state !== 'published')
          },
          totals: {
            expire: {
              future: 0,
              past: {
                week: 0,
                all: 0
              }
            }
          }
        };
        analysis.sessions.published.map(getExpirations).forEach(expiration => {
          analysis.totals.expire.future += expiration.future;
          analysis.totals.expire.past.week += expiration.past.week;
          analysis.totals.expire.past.all += expiration.past.all;
        });
        let email = false;
        if (analysis.sessions.published.length) {
          if (analysis.totals.expire.past.week && !analysis.totals.expire.future) {
            email = ['Your sessions have just expired', user.email, `<p>Dear ${user.given_name || user.name},</p>
            <p>Thanks for being one of the first providers to use the Open Sessions uploader. However, we’ve noticed you’ve been a little inactive lately.</p>
            <p>Login <a href="https://app.opensessions.io/">here</a> and upload more sessions on Open Sessions to ensure they are are visible to thousands of people on Get Active every month.</p>
            <p>Happy uploading!</p>`, { substitutions: { '-title-': 'Just checking in...', '-titleClass-': 'large' }, categories: ['engagement', 'engagement-expiring'] }];
          } else if (analysis.totals.expire.future) {
            email = ['Good news from Open Sessions', user.email, `<p>Dear ${user.given_name || user.name},</p>
            <p>Thanks for being one of the first providers to use the Open Sessions uploader. We wanted to let you know that your session information is now <b>live</b> on activity finders like Get Active!</p>
            <p>If your session information is up to date, please simply reply YES to this email. Otherwise, please visit Open Sessions and update them.</p>
            <ul>${analysis.sessions.published.map(session => {
              const expiration = getExpirations(session);
              if (expiration.future !== 0) {
                return `<li><a href="${sessionHref(session)}">${session.title}</a></li>`;
              }
              return '';
            }).join('')}</ul>
            <p>Happy uploading!</p>`, { substitutions: { '-title-': 'All systems go...', '-titleClass-': 'large' }, categories: ['engagement', 'engagement-live'] }];
          }
        } else if (analysis.sessions.drafts.length) {
          // No sessions published yet
        } else {
          // No sessions made yet
        }
        if (email) {
          sendEmail.apply(sendEmail, email);
          outbox.push(email);
        }
      });
      sendEmail('Email Engagement Summary', SERVICE_EMAIL, `<p>We've just generated engagement emails for the week from ${SERVICE_LOCATION}.</p>
        <p>Total sent: ${outbox.length}</p>
        <ul>${outbox.map(email => `<li><b>Subject:</b> ${email[0]}<br /><b>User:</b> &lt;${email[1]}&gt;</li>`).join('')}</ul>
      `, { substitutions: { '-title-': 'Weekly engagement email summary' } });
    });
  });
};

const sendDailyEmails = (models) => {
  sendFinishListingEmails(models);
};

const sendWeeklyEmails = (models) => {
  sendEngagementEmails(models);
};

module.exports = { sendWeeklyEmails, sendDailyEmails };
