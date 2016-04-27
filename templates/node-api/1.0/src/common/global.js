'use strict';

// 全局变量
global.constants = require('./constants');
global.config = require('./config');
global.func = require('../lib/func');
global.co = require('co');
global.thunkify = require('thunkify-wrap');
global.request = thunkify(require('request'));

// 数据库
config.db = require('./config.db').production;
global.Sequelize = require('sequelize');
global.db = new Sequelize(config.db.database, config.db.username, config.db.password, {
  dialect: config.db.dialect,
  host: config.db.host,
  port: config.db.port,
  timezone: '+08:00',
  pool: {
    maxConnections: config.db.pool
  },
  omitNull: true,
  logging: false
});

// 缓存
global.cache = require('redis').createClient(config.cache.port, config.cache.host);

// 阿里云
let ALY = require('aliyun-sdk');
global.oss = new ALY.OSS({
  accessKeyId: config.oss.key,
  secretAccessKey: config.oss.secret,
  endpoint: config.oss.endpoint,
  apiVersion: '2013-10-15'
});

// 全局错误
global.errors = require('./errors');
global.Exception = class {
  constructor(code, msg) {
    this.code = code;
    this.msg = msg || errors[code];
    this.stack = new Error(this.code + ': ' + this.msg).stack;
  }
};

// 加载相关代码
global.schemas = {};
global.models = {};
global.services = {};
require('../../bin/load_schemas');
require('../../bin/load_models');
require('../../bin/load_services');
