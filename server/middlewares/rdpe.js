const express = require('express');
const moment = require('moment-timezone');

const compareMicrotime = (dateString, operator) => { // eslint-disable-line consistent-return
  const date = new Date(dateString);
  const [lower, upper] = [-1, 1].map(sigma => new Date(date.getTime() + sigma)).map(d => d.toISOString());
  if (operator === '=') return { $lt: upper, $gt: lower };
  else if (operator === '>') return { $gt: upper };
  else if (operator === '<') return { $lt: lower };
};

module.exports = (database, options = {}) => {
  const rdpe = express();
  const { Session, Organizer, Activity } = database.models;

  rdpe.get('/', (req, res) => {
    res.json({
      sessions: `${options.baseURL}/sessions`,
    });
  });

  const hiddenFields = ['activityType', 'contactEmail', 'analytics', 'sortedSchedule', 'owner'];
  const organizerFields = ['contactName', 'contactPhone', 'socialWebsite', 'socialTwitter', 'socialFacebook', 'socialHashtag', 'socialInstagram'];

  rdpe.get('/sessions', (req, res) => {
    const fromTS = req.query.from || 0;
    const afterID = req.query.after;
    const where = {
      $or: [{
        updatedAt: compareMicrotime(fromTS, '='),
        uuid: {
          $gt: afterID
        }
      }, {
        updatedAt: compareMicrotime(fromTS, '>'),
      }],
      state: {
        $in: ['published', 'deleted', 'unpublished']
      }
    };
    const order = [
      ['updatedAt', 'ASC'],
      ['uuid', 'ASC']
    ];
    const limit = 50;
    Session.findAll({ where, order, limit, include: [Organizer, Activity] }).then(rawSessions => {
      const sessions = rawSessions.map(session => {
        const state = session.state === 'published' ? 'updated' : 'deleted';
        const item = {
          state,
          kind: 'session',
          id: session.uuid,
          modified: session.updatedAt.toISOString(),
        };
        if (state === 'updated') {
          item.data = session.toJSON();
          let { locationData } = item.data;
          if (locationData) {
            if (typeof locationData === 'string') locationData = JSON.parse(locationData);
            if ('placeID' in locationData && !options.preserveLatLng) {
              delete locationData.lat;
              delete locationData.lng;
            }
            if (locationData.manual) item.data.location = locationData.manual.join(', ');
            item.data.locationData = locationData;
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
          if (options.legacyOrganizerMerge) {
            organizerFields.forEach(field => {
              item.data[field] = item.data.info[field];
            });
          }
          hiddenFields.forEach(key => delete item.data[key]);
        }
        return item;
      });
      const next = {};
      if (sessions.length) {
        const lastSession = sessions[sessions.length - 1];
        next.from = lastSession.modified;
        next.after = lastSession.id;
      } else {
        if ('from' in req.query) next.from = req.query.from;
        if ('after' in req.query) next.after = req.query.after;
      }
      const query = Object.keys(next).map(key => [key, encodeURIComponent(next[key])].join('=')).join('&');
      res.json({
        items: sessions,
        next: `${options.baseURL}/sessions?${query}`,
        license: 'https://creativecommons.org/licenses/by/4.0/'
      });
    }).catch(error => {
      console.error('rdpe error', error);
      res.json({ error });
    });
  });

  return rdpe;
};
