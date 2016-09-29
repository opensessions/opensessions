const express = require('express');

module.exports = (app, database, opts) => {
  const rdpe = express();
  const { Session, Organizer, Activity } = database.models;
  const options = opts || {};

  rdpe.get('/', (req, res) => {
    res.json({
      sessions: '/api/rdpe/sessions',
    });
  });

  rdpe.get('/sessions', (req, res) => {
    const fromTS = req.query.from || 0;
    const afterID = req.query.after;
    const where = {
      $or: [
        {
          updatedAt: fromTS,
          uuid: {
            $gt: afterID
          }
        }, {
          updatedAt: {
            $gt: fromTS,
          },
        }
      ],
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
            item.data.locationData = locationData;
          }
          const { schedule } = item.data;
          if (schedule) {
            item.data.schedule = schedule.map(slot => {
              const points = ['start', 'end'];
              const formatted = {};
              points.forEach(point => {
                const date = new Date(`${slot.startDate}T${slot[`${point}Time`]}Z`);
                date.setTime(date.getTime() + (date.getTimezoneOffset() * 60 * 1000));
                formatted[point] = date;
              });
              return formatted;
            });
          }
          ['activityType', 'startDate', 'startTime', 'endTime'].forEach(key => delete item.data[key]);
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
        next: `${options.baseURL || '/api/rdpe'}/sessions?${query}`,
        license: 'https://creativecommons.org/licenses/by/4.0/'
      });
    }).catch(error => {
      console.log('rdpe error', error);
      res.json({ error });
    });
  });

  return rdpe;
};
