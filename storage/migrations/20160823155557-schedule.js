'use strict';

module.exports = {
  up: (migration, Sequelize, done) => migration.addColumn('Sessions', 'schedule', { type: Sequelize.JSON }).then(() => done()),
  down: (migration, Sequelize, done) => migration.removeColumn('Sessions', 'schedule').then(() => done())
};
