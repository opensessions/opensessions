/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize, done) => migration.addColumn('Activities', 'owner', { type: Sequelize.STRING }).then(() => done()),
  down: (migration, Sequelize, done) => migration.removeColumn('Activities', 'owner').then(() => done())
};
