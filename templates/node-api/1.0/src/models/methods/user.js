'use strict';

const models = require('..');

// 关联关系
exports.associate = function() {
  this.belongsTo(models.user, {as: 'test', foreignKey: 'id', constraints: false});
};

// 获取数据
exports.getById = function*(id) {
  let ret = yield this.findById(id);
  return ret;
};
