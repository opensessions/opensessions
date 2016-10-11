'use strict';

module.exports = {
  up: (queryInterface, Sequelize, done) => queryInterface.sequelize.query('Update public."Sessions" Set "updatedAt" = now();')
    .then(() => done()),
  down: (queryInterface, Sequelize, done) => done()
};
