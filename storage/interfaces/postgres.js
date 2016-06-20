'use strict';
const sequelize = require('sequelize');
const uuid = require('node-uuid');

class PostgresStorage {
  constructor(install) {
    this.user = {
      username: 'open_sessions',
      password: 'example',
    };
    this.db = {
      name: 'open_sessions',
      host: 'localhost',
    };
    if (install) {
      this.install();
    }
    this.getInstance();
    this.syncModels();
  }
  createUser() {
    // sudo -u postgres createuser ${this.user.username}
    // sudo -u postgres psql
    // ALTER USER ${this.user.username} PASSWORD ${this.user.password};
  }
  createDatabase() {
    // sudo -u postgres createdb ${this.db.name}
  }
  install() {
    this.createUser();
    this.createDatabase();
  }
  createModels() {
    const db = this.getInstance();
    db.define('Session', {
      // meta
      uuid: {
        type: sequelize.UUID,
        defaultValue: sequelize.UUIDV1,
        primaryKey: true,
      },
      isPublished: sequelize.BOOLEAN,
      owner: {
        type: sequelize.STRING,
        validation: {
          isEmail: true,
        },
      }, // using email for now
      // description
      title: sequelize.STRING(50),
      description: sequelize.STRING,
      organizer: sequelize.STRING,
      activityType: sequelize.STRING,
      // schedule details
      endTime: sequelize.TIME,
      startDate: sequelize.DATE,
      startTime: sequelize.TIME,
    });
    return db;
  }
  syncModels() {
    const db = this.createModels();
    return db.query(`drop owned by ${this.user.username}`)
      .then(() => db.sync())
      .then(() => db.models.Session.create({ uuid: uuid.v1(), title: 'mock title', description: 'mock title' }));
  }
  getInstance() {
    if (!this.instance) {
      const user = this.user;
      const db = this.db;
      this.instance = new sequelize(db.name, user.username, user.password, {
        host: db.host,
        dialect: 'postgres',
      });
    }
    return this.instance;
  }
}

module.exports = PostgresStorage;
