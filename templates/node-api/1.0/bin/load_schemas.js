'use strict';

// 引用
let fs = require('fs-extra');
let path = require('path');
let schemas = require('../src/common/schemas');

// 加载schemas
let traverse = function(cntPath) {
  let dir = fs.readdirSync(cntPath);

  for (let i = 0; i < dir.length; i++) {
    if (fs.statSync(path.join(cntPath, dir[i])).isDirectory()) {
      traverse(path.join(cntPath, dir[i]));
    } else {
      if (path.extname(dir[i]) !== '.json') continue;

      let name = path.basename(dir[i], '.json').replace(/(_.)/g, function(word) {
        return word[1].toUpperCase();
      });

      let schema = require(path.join(cntPath, dir[i]));
      schemas[name] = schema;
    }
  }
};

// 加载schemas
traverse(path.join(__dirname, '../src/models/schemas'));
