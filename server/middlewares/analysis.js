const { getAllUsers } = require('../../storage/users');

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const intervalsAgo = (date, interval) => Math.floor((Date.now() - date.getTime()) / (MS_PER_DAY * interval));

const makeAppAnalysis = (models, info) => {
  console.log('makeAppAnalysis');
  const getResources = Promise.all([
    getAllUsers(),
    models.Session.findAll({ state: { $not: 'deleted' } })
  ]);
  getResources.then(([users, sessions]) => {
    console.log('makeAppAnalysis getResources.all', users.length, sessions.length, models.Analysis.create);
    const userSessions = users.map(user => ({ user, sessions: sessions.filter(session => session.owner === user.user_id) }));
    const analysis = {
      timestamp: new Date(),
      version: process.env.npm_package_version,
      info,
      stats: {
        user: {
          total: users.length,
          active: users.filter(user => intervalsAgo(new Date(user.last_login), 1) > 28).length,
          published: userSessions.filter(data => data.sessions.length).length
        },
        session: {
          total: sessions.length,
          published: sessions.filter(session => session.state === 'published').length
        }
      }
    };
    models.Analysis.create({ analysis });
  });
};

module.exports = { makeAppAnalysis };
