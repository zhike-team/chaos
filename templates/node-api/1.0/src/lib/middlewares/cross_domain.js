'use strict';

// 允许跨域
module.exports = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
};
