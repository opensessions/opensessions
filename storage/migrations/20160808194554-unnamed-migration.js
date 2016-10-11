'use strict';

module.exports = {
  up: (migration, Sequelize, done) => migration.addColumn('Sessions', 'contactName', { type: Sequelize.STRING(50) }).then(() => done()),
  down: (migration, Sequelize, done) => migration.removeColumn('Sessions', 'contactName').then(() => done())
};
