const { execSync } = require('child_process');

const { getAllUsers } = require('../../storage/users');

const pkgJS = require('../../package.json');

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const daysAgo = date => Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);

const getDistribution = list => list.reduce((obj, stat) => {
  obj[stat] = (obj[stat] || 0) + 1;
  return obj;
}, {});

const getGitHash = () => execSync('git rev-parse HEAD').toString().trim();

const makeAppAnalysis = (models, info) => {
  const getResources = Promise.all([
    getAllUsers(),
    models.Session.findAll({ state: { $not: 'deleted' } })
  ]);
  getResources.then(([users, sessions]) => {
    const userSessions = users.map(user => ({ user, sessions: sessions.filter(session => session.owner === user.user_id) }));
    const viewStats = sessions.map(session => (session.analytics ? (session.analytics.views || 0) : 0));
    const totalViews = viewStats.reduce((a, b) => a + b);
    const publishedSessions = userSessions.filter(data => data.sessions.some(session => session.state === 'published'));
    const analysis = {
      timestamp: new Date(),
      version: pkgJS.version || process.env.HEROKU_RELEASE_VERSION || process.env.npm_package_version || false,
      gitHead: process.env.HEROKU_SLUG_COMMIT || getGitHash(),
      info,
      stats: {
        user: {
          total: users.length,
          active: {
            total: users.filter(user => daysAgo(user.last_login) > 28).length,
            distribution: getDistribution(users.map(user => daysAgo(user.last_login)))
          },
          published: {
            total: publishedSessions.length,
            live: publishedSessions.filter(data => data.sessions.some(session => session.sortedSchedule.some(slot => !slot.hasOccurred))).length
          }
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
  }).catch(console.error);
};

module.exports = { makeAppAnalysis };
