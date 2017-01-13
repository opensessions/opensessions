/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.addColumn('Sessions', 'analytics', { type: Sequelize.JSON }),
  down: (migration) => migration.removeColumn('Sessions', 'analytics')
};
