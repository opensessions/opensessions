const { getAllUsers } = require('../../storage/users');

const makeAppAnalysis = (models, info) => {
  const resources = {};
  const setResource = (resource, name) => {
    resources[name] = resource;
  };
  const getResources = Promise.all([
    getAllUsers().then(users => setResource('users', users))
  ]);
  getResources.then(() => {
    const analysis = {
      version: process.env.npm_package_version,
      info,
      stats: {
        user: {
          total: resources.users.length,
          published: 0
        }
      }
    };
    if (models.Analysis) models.Analysis.create({ analysis });
  });
};

module.exports = { makeAppAnalysis };
