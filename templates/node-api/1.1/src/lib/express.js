'use strict';

const config = require('../common/config');

const express = require('express');
// 实例化
const app = express();

// 中间件
app.use(require('compression')());
app.use(require('connect-timeout')(config.timeout * 1000, {respond: false}));
app.use(require('body-parser').urlencoded({
  extended: false,
}));
app.use(require('body-parser').json());
app.use(require('cookie-parser')());

module.exports = app;
