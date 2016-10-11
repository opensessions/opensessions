/* eslint arrow-body-style:0 */
'use strict';

module.exports = {
  up: (migration, Sequelize) => {
    return migration.addColumn('Sessions', 'socialWebsite', { type: Sequelize.STRING(256) }).then(() => {
      return migration.addColumn('Sessions', 'socialFacebook', { type: Sequelize.STRING(256) }).then(() => {
        return migration.addColumn('Sessions', 'socialInstagram', { type: Sequelize.STRING(64) }).then(() => {
          return migration.addColumn('Sessions', 'socialTwitter', { type: Sequelize.STRING(64) }).then(() => {
            return migration.addColumn('Sessions', 'socialHashtag', { type: Sequelize.STRING(64) });
          });
        });
      });
    });
  },
  down: (migration) => {
    return migration.removeColumn('socialHashtag').then(() => {
      return migration.removeColumn('socialTwitter').then(() => {
        return migration.removeColumn('socialInstagram').then(() => {
          return migration.removeColumn('socialFacebook').then(() => {
            return migration.removeColumn('socialWebsite');
          });
        });
      });
    });
  }
};
