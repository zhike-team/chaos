'use strict';

// 引用
const fs = require('fs-extra');
const path = require('path');
const schemas = require('../src/common/schemas');

// 加载schemas
const traverse = function(cntPath) {
  const dir = fs.readdirSync(cntPath);

  for (let i = 0; i < dir.length; i++) {
    if (fs.statSync(path.join(cntPath, dir[i])).isDirectory()) {
      traverse(path.join(cntPath, dir[i]));
    } else {
      if (path.extname(dir[i]) !== '.json') { continue; }

      const name = path.basename(dir[i], '.json').replace(/(_.)/g, word => {
        return word[1].toUpperCase();
      });

      const schema = require(path.join(cntPath, dir[i]));
      schemas[name] = schema;
    }
  }
};

// 加载schemas
traverse(path.join(__dirname, '../src/models/schemas'));
