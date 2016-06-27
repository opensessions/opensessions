'use strict';
const sequelize = require('sequelize');
const postgresEnv = require('../../postgres.env.json');

class PostgresStorage {
  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      this.writeTestEnv();
    }
    this.user = {
      username: process.env.OPENSESSIONS_PG_USER,
      password: process.env.OPENSESSIONS_PG_PASS,
    };
    this.db = {
      name: process.env.OPENSESSIONS_PG_DB,
      host: process.env.OPENSESSIONS_PG_HOST,
    };
    if (isDev) {
      this.dropModels();
    } else {
      this.syncModels();
    }
  }
  writeTestEnv() {
    Object.keys(postgresEnv).forEach((key) => {
      process.env[key] = postgresEnv[key];
    });
  }
  dropModels() {
    const db = this.getInstance();
    return db.query(`drop owned by ${this.user.username}`).then(() => db.sync());
  }
  syncModels() {
    const db = this.getInstance();
    return db.sync();
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
      const user = this.user;
      const db = this.db;
      const instance = new sequelize(db.name, user.username, user.password, {
        host: db.host,
        dialect: 'postgres',
        logging: false,
      });
      this.instance = this.createModels(instance);
    }
    return this.instance;
  }
}

module.exports = PostgresStorage;
