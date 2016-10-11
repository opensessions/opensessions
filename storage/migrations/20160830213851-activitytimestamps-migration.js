/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize) => {
    return migration.addColumn('Activities', 'createdAt', { type: Sequelize.DATE }).then(() => {
      return migration.addColumn('Activities', 'updatedAt', { type: Sequelize.DATE });
    });
  },
  down: (migration) => {
    return migration.removeColumn('createdAt').then(() => {
      return migration.removeColumn('updatedAt');
    });
  }
};
