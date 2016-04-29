'use strict';

// 引用
const fs = require('fs-extra');
const path = require('path');
const models = require('../src/common/models');
const schemas = require('../src/common/schemas');
const db = require('../src/common/db.js');
const log = require('rainbowlog');

// 加载models
const traverse = function(cntPath) {
  // 读取目录下的文件，并去除特殊目录。
  const dir = fs.readdirSync(cntPath).filter(exclude(['schemas', 'migrations', 'index.js']));
  for (let i = 0; i < dir.length; i++) {
    if (fs.statSync(path.join(cntPath, dir[i])).isDirectory()) {
      traverse(path.join(cntPath, dir[i]));
    } else {
      if (path.extname(dir[i]) !== '.js') { continue; }

      const name = path.basename(dir[i], '.js').replace(/(_.)/g, word => {
        return word[1].toUpperCase();
      });

      if (fs.existsSync(path.join(cntPath, dir[i]))) {
        const classMethods = require(path.join(cntPath, dir[i]));
        if (schemas[name] != null) {
          schemas[name].options.classMethods = classMethods;
        } else {
          log.warning(`Has no schema "${name}" but defined methods for it.`);
        }
      }
    }
  }
  for (const name of Object.keys(schemas)) {
    const model = db.define(name, schemas[name].attributes, schemas[name].options);
    models[name] = model;
  }
};

const exclude = function(excludings) {
  return function(dir) {
    return excludings.map(exc => dir !== exc).reduce((a, b) => a && b, true);
  };
};

// 加载models
traverse(path.join(__dirname, '../src/models/methods'));

/* eslint guard-for-in: 0 */
for (const i in models) {
  const model = models[i];

  if (model.associate) {
    model.associate(model);
  }
}
