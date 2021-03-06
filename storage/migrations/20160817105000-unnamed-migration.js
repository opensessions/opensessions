'use strict';

module.exports = {
  up: (migration, Sequelize, done) => {
    migration.addColumn('Sessions', 'abilityRestriction', { type: Sequelize.JSON });
    done();
  },
  down: (migration, Sequelize, done) => {
    migration.removeColumn('Sessions', 'abilityRestriction');
    done();
  }
};
