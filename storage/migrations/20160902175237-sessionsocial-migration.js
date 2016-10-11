/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize, done) => migration.addColumn('Sessions', 'socialWebsite', { type: Sequelize.STRING(256) })
    .then(() => migration.addColumn('Sessions', 'socialFacebook', { type: Sequelize.STRING(256) }))
    .then(() => migration.addColumn('Sessions', 'socialInstagram', { type: Sequelize.STRING(64) }))
    .then(() => migration.addColumn('Sessions', 'socialTwitter', { type: Sequelize.STRING(64) }))
    .then(() => migration.addColumn('Sessions', 'socialHashtag', { type: Sequelize.STRING(64) }))
    .then(() => done()),
  down: (migration, Sequelize, done) => migration.removeColumn('socialHashtag')
    .then(() => migration.removeColumn('socialTwitter'))
    .then(() => migration.removeColumn('socialInstagram'))
    .then(() => migration.removeColumn('socialFacebook'))
    .then(() => migration.removeColumn('socialWebsite'))
    .then(() => done())
};
