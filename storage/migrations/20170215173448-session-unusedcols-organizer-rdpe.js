/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: migration => migration.removeColumn('Sessions', 'attendanceType')
    .then(() => migration.removeColumn('Sessions', 'price'))
    .then(() => migration.removeColumn('Sessions', 'quantity'))
    .then(() => migration.removeColumn('Sessions', 'activityType'))
    .then(() => migration.removeColumn('Sessions', 'endTime'))
    .then(() => migration.removeColumn('Sessions', 'startDate'))
    .then(() => migration.removeColumn('Sessions', 'startTime'))
    .then(() => migration.removeColumn('Sessions', 'ActivityUuid')),
  down: (migration, Sequelize) => migration.addColumn('Sessions', 'attendanceType', Sequelize.STRING)
    .then(() => migration.addColumn('Sessions', 'price'), Sequelize.FLOAT(2))
    .then(() => migration.addColumn('Sessions', 'quantity'), Sequelize.INTEGER)
    .then(() => migration.addColumn('Sessions', 'activityType'), Sequelize.STRING)
    .then(() => migration.addColumn('Sessions', 'endTime'), Sequelize.TIME)
    .then(() => migration.addColumn('Sessions', 'startDate'), Sequelize.DATE)
    .then(() => migration.addColumn('Sessions', 'startTime'), Sequelize.TIME)
    .then(() => migration.addColumn('Sessions', 'ActivityUuid'), Sequelize.UUID)
};
