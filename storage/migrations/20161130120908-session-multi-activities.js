'use strict';
const uuid = require('node-uuid');

module.exports = {
  up: (migration, Sequelize) => {
    const { sequelize } = migration;
    return migration.createTable('SessionActivities', {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      ActivityUuid: Sequelize.UUID,
      SessionUuid: Sequelize.UUID
    }).then(() => sequelize.query('Select * from public."Sessions";').then(result => {
      const sessions = result[0];
      if (!!sessions && sessions.length > 0) {
        const query = `Insert into public."SessionActivities" (uuid, "createdAt", "updatedAt", "ActivityUuid", "SessionUuid") Values ${sessions.filter(s => s.ActivityUuid).map(s => `('${uuid.v1()}', now(), now(), '${s.ActivityUuid}', '${s.uuid}')`).join(', ')}`;
        return sequelize.query(query);
      }
      return true;
    }));
  },
  down: migration => migration.dropTable('SessionActivities')
};
