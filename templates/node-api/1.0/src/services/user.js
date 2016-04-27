'use strict';

// 控制器
module.exports = class Controller {
  // 获取用户信息
  *getUser(req, params) {
    let ret = yield models.user.getById(params.id);
    console.log('schemas', JSON.stringify(schemas, '', '  '));
    if (ret == null) {
      throw new Exception(2, '未找到该用户');
    }
    return 'Hello, ' + ret.name;
  }
};
