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
    const uuid = {
      type: sequelize.UUID,
      defaultValue: sequelize.UUIDV1,
      primaryKey: true,
    };
    db.define('Sport', {
      // meta
      uuid,
      name: sequelize.STRING,
    });
    const Organizer = db.define('Organizer', {
      // meta
      uuid,
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
      uuid,
      isPublished: sequelize.BOOLEAN,
      owner: sequelize.STRING,
      // description
      title: sequelize.STRING(50),
      description: sequelize.STRING(2048),
      activityType: sequelize.STRING,
      // description
      preparation: sequelize.STRING(2048),
      leader: sequelize.STRING,
      hasCoaching: sequelize.BOOLEAN,
      // location
      location: sequelize.STRING,
      locationData: sequelize.JSON,
      meetingPoint: sequelize.STRING,
      // price
      price: sequelize.FLOAT(2),
      // restriction
      genderRestriction: sequelize.STRING(16),
      minimumAgeRestriction: sequelize.INTEGER,
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
