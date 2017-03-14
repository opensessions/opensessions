'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('Update public."Sessions" Set "updatedAt" = now();'),
  down: (queryInterface, Sequelize) => Promise.resolve()
};
