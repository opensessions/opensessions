/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize, done) => migration.addColumn('Activities', 'createdAt', { type: Sequelize.DATE })
    .then(() => migration.addColumn('Activities', 'updatedAt', { type: Sequelize.DATE }))
    .then(() => done()),
  down: (migration, Sequelize, done) => migration.removeColumn('createdAt')
    .then(() => migration.removeColumn('updatedAt'))
    .then(() => done())
};
