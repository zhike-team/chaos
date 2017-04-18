'use strict';

// 全局变量
exports.constants = require('./constants');
exports.config = require('./config');
exports.func = require('../lib/func');

// 数据库
exports.db = require('./db');

// 缓存
exports.cache = require('./cache');

// 阿里云
exports.oss = require('./oss');

// 全局错误
exports.errors = require('./errors');
exports.Exception = require('./Exception');

// 模块相关
exports.schemas = require('./schemas');
exports.models = require('./models');
exports.services = require('./services');
