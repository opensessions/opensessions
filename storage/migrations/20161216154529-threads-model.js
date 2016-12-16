'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.createTable('Threads', {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      primaryKey: true
    },
    originEmail: Sequelize.STRING(256),
    metadata: Sequelize.JSON,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }),
  down: migration => migration.dropTable('Threads')
};
