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
    db.define('Organizer', {
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
      },
    });
    db.define('Session', {
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
      // location
      location: sequelize.STRING,
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
      },
    });
    db.models.Organizer.hasMany(db.models.Session, { as: 'sessions' });
    return db;
  }
  getInstance() {
    if (!this.instance) {
      const user = this.user;
      const db = this.db;
      const instance = new sequelize(db.name, user.username, user.password, {
        host: db.host,
        dialect: 'postgres',
      });
      this.instance = this.createModels(instance);
    }
    return this.instance;
  }
}

module.exports = PostgresStorage;
