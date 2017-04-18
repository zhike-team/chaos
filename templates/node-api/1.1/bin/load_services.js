'use strict';

// 引用
const fs = require('fs-extra');
const path = require('path');
const services = require('../src/common/services');

// 加载controllers
const traverse = function(cntPath) {
  const dir = fs.readdirSync(cntPath).filter(exclude(['index.js']));

  for (let i = 0; i < dir.length; i++) {
    if (fs.statSync(path.join(cntPath, dir[i])).isDirectory()) {
      traverse(path.join(cntPath, dir[i]));
    } else {
      if (path.extname(dir[i]) !== '.js') { continue; }

      const name = path.basename(dir[i], '.js').replace(/(_.)/g, word => {
        return word[1].toUpperCase();
      });

      const Service = require(path.join(cntPath, dir[i]));
      const service = new Service();

      for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(service))) {

        // skip porperties other than methods.
        const method = service[name];
        if (!(method instanceof Function) || method === Service) { continue; }

        // redefine methods with binded ones.
        Object.defineProperty(service, name, {
          enumerable: false,
          configurable: true,
          writable: true,
          value: method.bind(service),
        });
      }
      services[name] = service;
    }
  }
};

const exclude = function(excludings) {
  return function(dir) {
    return excludings.map(exc => dir !== exc).reduce((a, b) => a && b, true);
  };
};

// 加载controllers
traverse(path.join(__dirname, '../src/services'));
