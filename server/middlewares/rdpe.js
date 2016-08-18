const express = require('express');

module.exports = (app, database) => {
  const rdpe = express();
  const { Session, Organizer } = database.models;

  rdpe.get('/', (req, res) => {
    res.json({
      sessions: '/api/rdpe/sessions',
    });
  });

  rdpe.get('/sessions', (req, res) => {
    const fromTS = req.query.from || 0;
    let afterID = req.query.after;
    if (afterID) {
      afterID = afterID.substring(1, afterID.length - 1); // to convert `{uuid}` into `uuid`
    }
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
    Session.findAll({ where, order, limit, include: [Organizer] }).then((rawSessions) => {
      const sessions = rawSessions.map((session) => {
        const state = session.state === 'published' ? 'updated' : 'deleted';
        const item = {
          state,
          kind: 'session',
          id: session.uuid,
          modified: session.updatedAt.toISOString(),
        };
        if (state === 'updated') {
          item.data = session.toJSON();
          if (item.data.locationData) item.data.locationData = JSON.parse(item.data.locationData);
          if (item.data.startDate) {
            const timeFx = ['setHours', 'setMinutes', 'setSeconds'];
            if (item.data.startTime) {
              const startTime = item.data.startTime.split(':');
              timeFx.forEach((fx) => {
                item.data.startDate[fx](startTime.shift());
              });
            }
            if (item.data.endTime) {
              item.data.endDate = new Date(item.data.startDate.getTime());
              const endTime = item.data.endTime.split(':');
              timeFx.forEach((fx) => {
                item.data.endDate[fx](endTime.shift());
              });
            }
          }
        }
        return item;
      });
      let next = {
        from: 0,
        after: 0
      };
      if (sessions.length) {
        const lastSession = sessions[sessions.length - 1];
        next.from = lastSession.modified;
        next.after = lastSession.id;
      } else {
        next = req.query;
      }
      res.json({
        items: sessions,
        next: `/api/rdpe/sessions?from=${encodeURIComponent(next.from)}&after=${encodeURIComponent(next.after)}`,
        license: 'https://creativecommons.org/licenses/by/4.0/'
      });
    }).catch((error) => {
      res.json({ error });
    });
  });

  return rdpe;
};
