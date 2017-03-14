'use strict';

module.exports = {
  up: queryInterface => queryInterface.sequelize.query('Update public."Sessions" Set "updatedAt" = now();'),
  down: () => Promise.resolve()
};
