/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.addColumn('Activities', 'parentUuid', Sequelize.UUID),
  down: (migration) => migration.removeColumn('Activities', 'parentUuid')
};
