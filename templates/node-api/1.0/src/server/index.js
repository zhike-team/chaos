'use strict';

// 引用
const config = require('../common/config');
let router = require('./router');

// 实例化
let app = require('../lib/express');

app.use(require('../lib/middlewares/cross_domain'));

// 路由
router(app);

// 错误捕获
process.on('uncaughtException', function(err) {
  console.error('Global Error:');
  console.error(err.stack);
  process.exit(0);
});

// 启动监听
app.listen(config.port);
console.log(config.name + ' server start: ' + config.port);
