'use strict';

module.exports = {
  up: (migration, Sequelize, done) => migration.addColumn('Organizers', 'image', { type: Sequelize.STRING(512) }).then(() => done()),
  down: (migration, Sequelize, done) => migration.removeColumn('Organizers', 'image').then(() => done())
};
