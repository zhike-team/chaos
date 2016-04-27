'use strict';

// 引用
let fs = require('fs-extra');
let path = require('path');
let models = require('../src/common/models');;
let schemas = require('../src/common/schemas');;
let db = require('../src/common/db.js');

// 加载models
let traverse = function(cntPath) {
  // 读取目录下的文件，并去除特殊目录。
  let dir = fs.readdirSync(cntPath).filter(exclude(['schemas', 'migrations', 'index.js']));

  for (let i = 0; i < dir.length; i++) {
    if (fs.statSync(path.join(cntPath, dir[i])).isDirectory()) {
      traverse(path.join(cntPath, dir[i]));
    } else {
      if (path.extname(dir[i]) !== '.js') continue;

      let name = path.basename(dir[i], '.js').replace(/(_.)/g, function(word) {
        return word[1].toUpperCase();
      });

      if (fs.existsSync(path.join(cntPath, dir[i]))) {
        let classMethods = require(path.join(cntPath, dir[i]));
        schemas[name].options.classMethods = classMethods;
      }
      let model = db.define(name, schemas[name].attributes, schemas[name].options);
      models[name] = model;
    }
  }
};

let exclude = function(excludings) {
  return function(dir) {
    return excludings.map(exc => dir !== exc).reduce((a, b) => a && b, true);
  }
}

// 加载models
traverse(path.join(__dirname, '../src/models/methods'));

for (let i in models) {
  let model = models[i];

  if (model.associate) {
    model.associate(model);
  }
}

