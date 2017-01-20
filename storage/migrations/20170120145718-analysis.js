'use strict';

module.exports = {
  up: (migration, Sequelize) => migration.createTable('Analysis', {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      primaryKey: true
    },
    analysis: Sequelize.JSON,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }),
  down: migration => migration.dropTable('Analysis')
};
