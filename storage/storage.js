'use strict';
const postgresStorage = require('./interfaces/postgres.js');

class Storage {
  constructor() {
    this.instance = new postgresStorage();
  }
  install() {
    return this.instance.install();
  }
  getInstance() {
    return this.instance.getInstance();
  }
  createModels() {
    return this.instance.createModels();
  }
}

module.exports = Storage;
