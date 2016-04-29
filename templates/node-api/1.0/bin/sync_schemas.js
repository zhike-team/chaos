'use strict';

// 引用
const co = require('co');
const Sequelize = require('sequelize');
const fs = require('fs-extra');
const path = require('path');
const config = require('../src/common/config');
const log = require('rainbowlog');
config.db = require('../src/common/config.db').production;

// 连接数据库
const db = new Sequelize(config.db.database, config.db.username, config.db.password, {
  dialect: config.db.dialect,
  host: config.db.host,
  port: config.db.port,
  timezone: '+08:00',
  pool: {
    maxConnections: config.db.pool,
  },
  omitNull: true,
  logging: false,
});

// 加载schemas
co(function *() {
  const queryInterface = db.getQueryInterface();
  const tables = yield queryInterface.showAllTables();

  for (let i = 0; i < tables.length; i++) {
    if (tables[i].substr(0, config.db.prefix.length) !== config.db.prefix) {
      continue;
    }

    // 获取名称
    let name = tables[i].substr(config.db.prefix.length);
    name = name.replace(/(_.)/g, word => {
      return word[1].toUpperCase();
    });

    // 获取属性
    const tmpAttributes = yield queryInterface.describeTable(tables[i]);
    const attributes = {};
    Object.keys(tmpAttributes).map(key => {
      if (key === 'created_at' || key === 'updated_at') {
        return;
      }

      const newKey = key.replace(/(_.)/g, word => {
        return word[1].toUpperCase();
      });

      tmpAttributes[key].field = key;
      attributes[newKey] = tmpAttributes[key];
    });

    // 同步文件
    fs.mkdirsSync(path.join(__dirname, '../src/models/schemas'));
    fs.writeFileSync(
      path.join(__dirname,
                '../src/models/schemas',
                `${tables[i].substr(config.db.prefix.length)}.json`),
      JSON.stringify({
        name: name,
        attributes: attributes,
        options: {
          tableName: tables[i],
          createdAt: false,
          updatedAt: false,
        },
      }, '', '  ')
    );
  }
}).then(() => {
  log.info('done');
  process.exit(0);
}, err => {
  log.error('error');
  log.error(err.stack);
  process.exit(0);
});
