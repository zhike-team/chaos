'use strict';

// 引用
let crypto = require('crypto');

// 生成MD5
exports.md5 = function(data) {
  return crypto.createHash('md5').update(data, 'utf8').digest('hex');
};
