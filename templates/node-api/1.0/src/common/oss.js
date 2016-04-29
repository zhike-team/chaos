'use strict';

const ALY = require('aliyun-sdk');
const config = require('./config');

module.exports = new ALY.OSS({
  accessKeyId: config.oss.key,
  secretAccessKey: config.oss.secret,
  endpoint: config.oss.endpoint,
  apiVersion: '2013-10-15',
});
