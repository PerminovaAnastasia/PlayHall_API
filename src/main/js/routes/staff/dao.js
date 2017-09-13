"use strict";

const config = require('config');
const Dao = require('../../common/amazon').daoCommon;
const tableName = "kobro-" + config.get("env") + "-users";
const userDao = new Dao(tableName);


module.exports = {
  userDao: userDao
};