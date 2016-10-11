/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize) => {
    return migration.addColumn('Activities', 'owner', { type: Sequelize.STRING });
  },
  down: (migration) => {
    return migration.removeColumn('Activities', 'owner');
  }
};
