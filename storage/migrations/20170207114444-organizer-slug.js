/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.addColumn('Organizers', 'slug', { type: Sequelize.STRING(32), unique: true }),
  down: (migration) => migration.removeColumn('Organizers', 'slug')
};
