'use strict';

// 引用
let Router = require('../lib/router');

// 路由
let router = new Router(require('../routes'));

// 设置
module.exports = function(app) {

  app.use(router.forExpress());

  // 404
  app.get('*', function(req, res) {
    res.send({
      code: 2,
      msg: errors[2]
    });
  });
};
