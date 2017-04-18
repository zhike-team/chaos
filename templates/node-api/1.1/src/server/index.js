'use strict';

// 引用
const config = require('../common/config');
const router = require('./router');
const log = require('rainbowlog');

// 实例化
const app = require('../lib/express');

app.use(require('../lib/middlewares/cross_domain'));

// 路由
router(app);

// 错误捕获
process.on('uncaughtException', err => {
  log.error('Global Error:');
  log.error(err.stack);
  process.exit(0);
});

// 启动监听
app.listen(config.port);
log.info(`${config.name} server start: ${config.port}`);
