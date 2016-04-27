'use strict';

const co = require('co');
const func = require('./func.js');
const config = require('../common/config');

// 引用
let log = require('util').log;
let multipart = require('co-multipart');

// 运行
module.exports = function(action, options) {
  options = options || {};

  return function(req, res, next) {
    // 记录开始时间
    let cntTime = new Date();

    // 错误处理函数
    let errorHandle = function(err) {
      console.log(err.stack);
      err.code = config.errorPrefix + (err.code || 1);
      res.send({
        code: err.code,
        msg: err.msg || '未知错误'
      });
    };

    // 不需要自动返回JSON
    if (options.raw) {
      co(function*() {
        yield action(req, res)
      }).then(function() {}, errorHandle);
      return;
    }

    // 执行
    co(function*() {
      // 从缓存中读取数据
      let key = func.md5(config.name + '.' + req.path + '.' + JSON.stringify(req.query));
      if (options.cache) {
        let data = yield thunkify(cache.get).bind(cache)(key);
        if (data !== null) {
          return JSON.parse(data);
        }
      }

      // 获取参数
      let params = Object.assign({}, req.method === 'GET' ? req.query : req.body, req.params);
      if (options.multipart) {
        let parts = yield * multipart(req);
        params = parts.field;
        parts.files.map(function(file) {
          params[file.fieldname] = file;
        });
      }

      // 执行
      let data = yield action(req, params);

      // 缓存数据
      if (options.cache) {
        yield thunkify(cache.setex).bind(cache)(key, config.cache.time, JSON.stringify(data));
      }

      return data;
    }).then(function(data) {
      // 返回
      res.send({
        code: 0,
        data: data
      });

      // 记录时间
      log(`${new Date().getTime() - cntTime.getTime()}ms - ${req.method} - ${req.url}`);
    }, errorHandle);
  };
};
