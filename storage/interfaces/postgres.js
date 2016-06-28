'use strict';
const sequelize = require('sequelize');
const postgresEnv = require('../../postgres.env.json');

class PostgresStorage {
  constructor() {
    if (!process.env.IS_HEROKU) {
      postgresEnv.DATABASE_URL = process.env.DATABASE_URL;
    }
  }
  createModels(db) {
    const Organizer = db.define('Organizer', {
      // meta
      uuid: {
        type: sequelize.UUID,
        defaultValue: sequelize.UUIDV1,
        primaryKey: true,
      },
      owner: sequelize.STRING,
      name: sequelize.STRING,
    }, {
      getterMethods: {
        href() {
          return `/organizer/${this.uuid}`;
        },
        displayName() {
          return this.name;
        },
      },
      classMethods: {
        getQuery(req) {
          return {
            where: { owner: req.user.user_id },
            include: [db.models.Session],
          };
        },
      },
    });
    const Session = db.define('Session', {
      // meta
      uuid: {
        type: sequelize.UUID,
        defaultValue: sequelize.UUIDV1,
        primaryKey: true,
      },
      isPublished: sequelize.BOOLEAN,
      owner: sequelize.STRING,
      // description
      title: sequelize.STRING(50),
      description: sequelize.STRING,
      activityType: sequelize.STRING,
      // description
      preparation: sequelize.STRING,
      leader: sequelize.STRING,
      hasCoaching: sequelize.BOOLEAN,
      // location
      location: sequelize.STRING,
      locationData: sequelize.JSON,
      meetingPoint: sequelize.STRING,
      // contact
      contactPhone: sequelize.STRING,
      contactEmail: sequelize.STRING,
      // schedule details
      endTime: sequelize.TIME,
      startDate: sequelize.DATE,
      startTime: sequelize.TIME,
    }, {
      getterMethods: {
        href() {
          return `/session/${this.uuid}`;
        },
        displayName() {
          return `${this.title || 'Untitled'}${this.isPublished ? '' : ' (draft)'}`;
        },
      },
    });
    Session.belongsTo(Organizer);
    Organizer.hasMany(Session);
    return db;
  }
  getInstance() {
    if (!this.instance) {
      const instance = new sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
      });
      this.instance = this.createModels(instance);
    }
    return this.instance;
  }
}

module.exports = PostgresStorage;
