'use strict';
const sequelize = require('sequelize');
const definitions = require('../models')(sequelize);
const extend = require('extend');

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
    const models = {};
    const { tables, tablePrototype } = definitions;
    Object.keys(tables).forEach(name => {
      const fields = extend({}, tablePrototype, tables[name]);
      const options = fields._options;
      delete fields._options;
      models[name] = db.define(name, fields, options);
    });
    Object.keys(models).map(name => models[name]).filter(model => model.makeAssociations).forEach(model => model.makeAssociations(models));
    return db;
  }
  getInstance() {
    if (!this.instance) {
      const DATABASE_URL = this.DATABASE_URL;
      const instance = new sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: process.env.DISABLE_PG_LOGS ? false : console.log,
        omitNull: true,
        freezeTableName: true
      });
      this.instance = this.createModels(instance);
    }
    return this.instance;
  }
}

module.exports = PostgresStorage;
