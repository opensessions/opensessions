/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.addColumn('Organizers', 'data', { type: Sequelize.JSON }),
  down: (migration) => migration.removeColumn('Organizers', 'data')
};
