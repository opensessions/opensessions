"use strict";
const storage = require('./interfaces/postgres.js');

class Storage {
  constructor() {
    this._instance = new storage();
  }
  install() {
    return this._instance.install();
  }
  getInstance() {
    return this._instance.getInstance();
  }
  createModels() {
    return this._instance.createModels();
  }
}

module.exports = Storage;
