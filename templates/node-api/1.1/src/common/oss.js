'use strict';

const OSS = require('ali-oss');
const config = require('./config').oss || {};

module.exports = new OSS({
  endpoint: config.endpoint,
  accessKeyId: config.key,
  accessKeySecret: config.secret,
  bucket: config.bucket,
});
