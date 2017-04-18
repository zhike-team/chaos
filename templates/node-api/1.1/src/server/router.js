'use strict';

// 引用
const Router = require('../lib/router');
const errors = require('../common/errors');

// 路由
const router = new Router(require('../routes'));

// 设置
module.exports = function(app) {

  app.use(router.forExpress());

  // 404
  app.get('*', (req, res) => {
    res.send({
      code: 2,
      msg: errors[2],
    });
  });
};
