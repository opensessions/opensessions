const { getAllUsers } = require('../../storage/users');

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const daysAgo = date => Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);

const getDistribution = list => list.reduce((obj, stat) => {
  obj[stat] = (obj[stat] || 0) + 1;
  return obj;
}, {});

const makeAppAnalysis = (models, info) => {
  const getResources = Promise.all([
    getAllUsers(),
    models.Session.findAll({ state: { $not: 'deleted' } })
  ]);
  getResources.then(([users, sessions]) => {
    const userSessions = users.map(user => ({ user, sessions: sessions.filter(session => session.owner === user.user_id) }));
    const viewStats = sessions.map(session => (session.analytics ? (session.analytics.views || 0) : 0));
    const totalViews = viewStats.reduce((a, b) => a + b);
    const analysis = {
      timestamp: new Date(),
      version: process.env.npm_package_version,
      gitHead: process.env.npm_package_gitHead,
      info,
      stats: {
        user: {
          total: users.length,
          active: users.filter(user => daysAgo(user.last_login) > 28).length,
          activityDistribution: getDistribution(users.map(user => daysAgo(user.last_login))),
          published: userSessions.filter(data => data.sessions.length).length
        },
        session: {
          total: sessions.length,
          published: sessions.filter(session => session.state === 'published').length,
          publishedYesterday: sessions.filter(session => session.state === 'published' && daysAgo(session.updatedAt) === 1).length,
          views: {
            total: totalViews,
            distribution: getDistribution(viewStats)
          }
        }
      }
    };
    models.Analysis.create({ analysis });
  });
};

module.exports = { makeAppAnalysis };
