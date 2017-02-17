'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.createTable('Partner', {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      primaryKey: true
    },
    userId: Sequelize.STRING(256),
    data: Sequelize.JSON,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }),
  down: migration => migration.dropTable('Partner')
};
