'use strict';

// 引用
let co = require('co');
let Sequelize = require('sequelize');
let fs = require('fs-extra');
let path = require('path');
let config = require('../src/common/config');
config.db = require('../src/common/config.db').production;

// 连接数据库
let db = new Sequelize(config.db.database, config.db.username, config.db.password, {
  dialect: config.db.dialect,
  host: config.db.host,
  port: config.db.port,
  timezone: '+08:00',
  pool: {
    maxConnections: config.db.pool
  },
  omitNull: true,
  logging: false
});

// 加载schemas
co(function*() {
  let queryInterface = db.getQueryInterface();
  let tables = yield queryInterface.showAllTables();

  for (let i = 0; i < tables.length; i++) {
    if (tables[i].substr(0, config.db.prefix.length) !== config.db.prefix) {
      continue;
    }

    // 获取名称
    let name = tables[i].substr(config.db.prefix.length);
    name = name.replace(/(_.)/g, function(word) {
      return word[1].toUpperCase();
    });

    // 获取属性
    let tmpAttributes = yield queryInterface.describeTable(tables[i]);
    let attributes = {};
    Object.keys(tmpAttributes).map(function(key) {
      if (key === 'created_at' || key === 'updated_at') {
        return;
      }

      let newKey = key.replace(/(_.)/g, function(word) {
        return word[1].toUpperCase();
      });

      tmpAttributes[key].field = key;
      attributes[newKey] = tmpAttributes[key];
    });

    // 同步文件
    fs.mkdirsSync(path.join(__dirname, '../src/models/schemas'));
    fs.writeFileSync(
      path.join(__dirname, '../src/models/schemas', tables[i].substr(config.db.prefix.length) + '.json'),
      JSON.stringify({
        name: name,
        attributes: attributes,
        options: {
          tableName: tables[i],
          createdAt: false,
          updatedAt: false
        }
      }, '', '  ')
    );
  }
}).then(function() {
  console.log('done');
  process.exit(0);
}, function(err) {
  console.log('error');
  console.log(err.stack);
  process.exit(0);
});
