'use strict';
const sequelize = require('sequelize');
const dotenv = require('dotenv');
const models = require('../models')(sequelize);
const extend = require('extend');

dotenv.config({ silent: true });
dotenv.load();

class PostgresStorage {
  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.syncModels();
  }
  dropModels() {
    const db = this.getInstance();
    return db.query(`drop owned by ${process.env.DATABASE_USER}`).then(() => db.sync());
  }
  syncModels() {
    const db = this.getInstance();
    return db.sync();
  }
  createModels(db) {
    const defs = {};
    const { tablePrototype } = models;
    Object.keys(models.tables).forEach((name) => {
      const fields = extend({}, tablePrototype, models.tables[name]);
      const options = fields._options;
      delete fields._options;
      defs[name] = db.define(name, fields, options);
    });
    models.associations.forEach((assoc) => {
      const associationType = assoc.type;
      const source = defs[assoc.source];
      const target = defs[assoc.target];
      source[associationType](target);
    });
    return db;
  }
  getInstance() {
    if (!this.instance) {
      const DATABASE_URL = this.DATABASE_URL;
      const instance = new sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        omitNull: true,
      });
      this.instance = this.createModels(instance);
    }
    return this.instance;
  }
}

module.exports = PostgresStorage;
