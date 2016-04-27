'use strict';

// 引用
let fs = require('fs-extra');
let path = require('path');

// 加载controllers
let traverse = function(cntPath) {
  let dir = fs.readdirSync(cntPath);

  for (let i = 0; i < dir.length; i++) {
    if (fs.statSync(path.join(cntPath, dir[i])).isDirectory()) {
      traverse(path.join(cntPath, dir[i]));
    } else {
      if (path.extname(dir[i]) !== '.js') continue;

      let name = path.basename(dir[i], '.js').replace(/(_.)/g, function(word) {
        return word[1].toUpperCase();
      });

      let Service = require(path.join(cntPath, dir[i]));
      let service = new Service();

      for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(service))) {

          // skip porperties other than methods.
          let method = service[name];
          if (!(method instanceof Function) || method === Service) continue;

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

// 加载controllers
traverse(path.join(__dirname, '../src/services'));
