const express = require('express');
const moment = require('moment-timezone');

const compareMicrotime = (dateString, operator = '=') => {
  const date = new Date(dateString);
  const [lower, upper] = [-1, 1].map(sigma => new Date(date.getTime() + sigma)).map(d => d.toISOString());
  if (operator === '>') return { $gt: upper };
  else if (operator === '<') return { $lt: lower };
  return { $lt: upper, $gt: lower };
};

const hiddenFields = ['aggregators', 'contactEmail', 'analytics', 'sortedSchedule', 'owner'];
const organizerFields = ['contactName', 'contactPhone', 'socialWebsite', 'socialTwitter', 'socialFacebook', 'socialHashtag', 'socialInstagram'];

const sessionToItem = (session, options = {}, isShown) => {
  const item = {
    state: session.state,
    kind: 'session',
    id: session.uuid,
    modified: session.updatedAt.toISOString(),
  };
  if (item.state === 'published') item.state = 'updated';
  if (item.state === 'unpublished') item.state = 'deleted';
  if (item.state === 'updated' && isShown) {
    item.state = isShown(session) ? 'updated' : 'deleted';
  }
  if (item.state === 'updated') {
    item.data = session.toJSON();
    const { info } = session;
    if (info.location.data) {
      if ('placeID' in info.location.data && !options.preserveLatLng) {
        delete info.location.data.lat;
        delete info.location.data.lng;
      }
      item.data.location = info.location.data.manual ? info.location.data.manual.join(', ') : info.location.address;
      item.data.locationData = info.location.data;
    }
    const { schedule } = item.data;
    if (schedule) {
      const defaultTime = { start: '00:00:00', end: '23:59:59' };
      item.data.schedule = schedule.map(slot => {
        const formatted = {};
        ['start', 'end'].forEach(point => {
          const date = moment.tz(`${slot.startDate}T${slot[`${point}Time`] || defaultTime[point]}`, options.timezone);
          formatted[point] = options.scrubTimezone ? date.utc().format() : date.format();
        });
        return formatted;
      });
    }
    if (item.data.Activities) item.data.Activities = item.data.Activities.map(activity => activity.name);
    item.data.website = `${options.URL}${item.data.href}`;
    item.data.messageURL = `${options.URL}${item.data.href}/action/message`;
    hiddenFields.forEach(key => delete item.data[key]);
    if (options.legacyOrganizerMerge && session.Organizer && session.Organizer.data) {
      organizerFields.forEach(field => {
        item.data[field] = session.Organizer.data[field] || item.data[field];
      });
      if (session.Organizer.data.noSchedule) delete item.data.schedule;
      if (session.Organizer.data.noPricing) delete item.data.pricing;
    }
  }
  return item;
};

const reqToSearch = (req, models, extraWhere = {}) => {
  const fromTS = req.query.from || 0;
  const afterID = req.query.after;
  return {
    where: Object.assign({
      state: {
        $in: ['published', 'deleted', 'unpublished']
      },
      $or: [{
        updatedAt: compareMicrotime(fromTS, '='),
        uuid: {
          $gt: afterID
        }
      }, {
        updatedAt: compareMicrotime(fromTS, '>'),
      }]
    }, extraWhere),
    order: [
      ['updatedAt', 'ASC'],
      ['uuid', 'ASC']
    ],
    limit: 40,
    include: [models.Organizer, models.Activity]
  };
};

const rdpe = (database, options = {}) => {
  const api = express();
  const { Session, Partner } = database.models;

  api.get('/', (req, res) => {
    res.json({
      sessions: `${options.baseURL}/sessions`,
    });
  });

  api.get('/sessions', (req, res) => {
    Partner.findAll()
      .then(partners => partners.map(p => p.userId).filter(id => id))
      .then(partnerIDs => Session.findAll(reqToSearch(req, database.models))
        .then(rawSessions => {
          const sessions = rawSessions.map(session => sessionToItem(session, options, s => partnerIDs.indexOf(s.owner) === -1));
          const next = {};
          if (sessions.length) {
            const lastSession = sessions[sessions.length - 1];
            next.from = lastSession.modified;
            next.after = lastSession.id;
          } else {
            ['from', 'after'].filter(key => key in req.query).forEach(key => (next[key] = req.query[key]));
          }
          res.json({
            items: sessions,
            next: `${options.baseURL}/sessions?${Object.keys(next).map(key => [key, encodeURIComponent(next[key])].join('=')).join('&')}`,
            license: 'https://creativecommons.org/licenses/by/4.0/'
          });
        })
      ).catch(error => {
        console.error('rdpe error', error);
        res.json({ error });
      });
  });

  return api;
};

module.exports = { reqToSearch, sessionToItem, rdpe };
