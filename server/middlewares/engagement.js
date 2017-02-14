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
  identities: [{user_id: '100229880746808785817',provider: 'google-oauth2',connection: 'google-oauth2',isSocial: true}],
  created_at: '2016-06-24T10:59:33.581Z',
  last_ip: '82.163.127.74',
  last_login: '2016-06-28T11:00:51.488Z',
  logins_count: 12
} */

const { SERVICE_LOCATION, SERVICE_EMAIL } = process.env;

const { getAllUsers } = require('../../storage/users');
const { sendEmail, getStyledElement } = require('./email');

const sessionHref = session => `${SERVICE_LOCATION}${session.href}`;

const sendFinishListingEmails = (models, users) => {
  models.Session.findAll({ where: { state: 'draft' } }).then(drafts => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const yesterdayDateString = now.toDateString();
    const yesterdayDrafts = drafts.filter(draft => (new Date(draft.createdAt)).toDateString() === yesterdayDateString);
    yesterdayDrafts.forEach(draft => {
      const user = users.find(u => u.user_id === draft.owner);
      sendEmail('Finish your Open Sessions listing', user.email, `<p>Dear ${user.nickname || user.name},</p>
        <p>Congratulations on starting your listing ${draft.title ? `<b>${draft.title}</b>` : 'on Open Sessions'}.</p>
        <p>You're just a few steps away from getting the word out about your session.</p>
        <p>${getStyledElement('button', 'Finish your listing', { href: sessionHref(draft) }, 'a')}</p>
        <h2>Why use Open Sessions?</h2>
        <p>Open Sessions is the easy way to get the sessions you run discovered by the thousands of people across the country searching for physical activity via the web's activity finders.</p>
        <p><a href="${sessionHref(draft)}/edit">Complete your session listing</a> and publish it to start letting people know about the great sessions you run.</p>
      `, { substitutions: { '-title-': 'You\'re nearly there!', '-titleClass-': 'large' }, categories: ['engagement', 'engagement-finishlisting'] });
    });
  });
};

const sendExpiredListingEmails = (models, users) => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const tomorrow = date.getTime();
  const slotHasOccurredAtTime = (slot, time) => (new Date(slot.start)).getTime() < time;
  const sessionExpiresTomorrow = session => {
    const pending = session.sortedSchedule.filter(slot => !slot.hasOccurred);
    return pending.length && pending.every(slot => slotHasOccurredAtTime(slot, tomorrow));
  };
  const openSessionsAggregator = {
    name: 'Open Sessions',
    description: 'There are no compatible activity finders in your area for us to publish your session on just now. Fear not! Open Sessions is expanding. We’ll be in touch as soon as your session appears somewhere new.<br /><br />You can still use Open Sessions to promote your session by sharing the listing through your social media channels.',
    image: '/images/aggregators/opensessions.png'
  };
  models.Session.findAll({ where: { state: 'published' } }).then(sessions => {
    const sessionsExpiringTomorrow = sessions.filter(sessionExpiresTomorrow);
    users.forEach(user => {
      const userSessionsExpiring = sessionsExpiringTomorrow.filter(s => s.owner === user.user_id);
      if (userSessionsExpiring.length) {
        userSessionsExpiring.forEach(session => sendEmail('Your session\'s schedule is coming to an end!', user.email, `
          <p>The schedule for your session <b>${session.title}</b> is coming to an end soon.</p>
          <p>Add more sessions to the schedule to keep this listing active.</p>
          <p>${getStyledElement('button', 'Update Schedule', { href: sessionHref(session) }, 'a')}</p>
          <h1>Where does my session appear?</h1>
          <ol class="aggregators">
            ${(session.aggregators.length ? session.aggregators : [Object.assign({ href: sessionHref(session) }, openSessionsAggregator)]).map(aggregator => `<li>
              ${getStyledElement('imageCircle', `<img src="${aggregator.img}" style="max-width:100%;border-radius:2em;" />`, {}, 'span')}
              <div class="info">
                <h2>${aggregator.name}</h2>
                <p>${aggregator.description}</p>
                <a href="${aggregator.href}" style="color: inherit;">View your session on ${aggregator.name}</a>
              </div>
            </li>`).join('')}
            <li class="meta-info">
              ${session.aggregators.length ? `Your session appears on ${session.aggregators.length} activity finder${session.aggregators.length > 1 ? 's' : ''}` : 'Your session doesn\'t appear anywhere yet. We\'ll be in touch'}
            </li>
          </ol>
          <h1>What can we do better?</h1>
          <p>Open Sessions is still in beta testing - your feedback helps us improve it.</p>
          <p>What would have made things easier for you? Let us know by simply replying to this email with your feedback.</p>
        `, { substitutions: { '-title-': 'Your schedule finishes soon!' }, categories: ['engagement', 'engagement-expire-tomorrow'] }));
      }
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
  models.Session.findAll({ where: { state: { $not: 'deleted' } } }).then(allSessions => {
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
          if (analysis.totals.expire.future) {
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
  getAllUsers().then(users => {
    sendFinishListingEmails(models, users);
    sendExpiredListingEmails(models, users);
  });
};

const sendWeeklyEmails = (models) => {
  sendEngagementEmails(models);
};

module.exports = { sendWeeklyEmails, sendDailyEmails };
