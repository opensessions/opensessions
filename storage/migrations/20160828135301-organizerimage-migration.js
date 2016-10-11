'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.addColumn('Organizers', 'image', { type: Sequelize.STRING(512) }),
  down: (migration) => migration.removeColumn('Organizers', 'image')
};
