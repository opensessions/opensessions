'use strict';

module.exports = {
  up: (migration, Sequelize, done) => {
    migration.addColumn('Sessions', 'image', { type: Sequelize.STRING(512) });
    done();
  },
  down: (migration, Sequelize, done) => {
    migration.removeColumn('Sessions', 'image');
    done();
  }
};
