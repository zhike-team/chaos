'use strict';

const ExpressRouter = require('express').Router;
const join = require('path').join;
const run = require('./run');
const methods = require('methods').concat('all');

module.exports = class Router {
  constructor(configure) {
    methods.forEach(method => {
      this[method] = (path, action, options) => {
        this[method][path] = [action, options];
      };
    });
    this.use = (path, subRouter) => {
      if (typeof subRouter === 'function') {
        const sub = new Router(subRouter);
        this.use[path] = sub;
      } else {
        this.use[path] = subRouter;
      }
    };
    if (typeof configure === 'function') {
      configure(this);
    }
  }
  get routes() {
    const signs = Object.keys(this)
                      .filter(method => method !== 'use')
                      .map(method => Object.keys(this[method]).map(path => [method, path]))
                      .reduce((a, b)=>a.concat(b), []);
    let routes = signs.map(sign => `${sign[0].toUpperCase()} ${sign[1]}`);

    const subPaths = Object.keys(this.use);
    const subRoutes = subPaths.map(path => this.use[path].routes.map(sub => {
      const words = sub.split(/ +/);
      words[1] = join(path, words[1]);
      return words.join(' ');
    })).reduce((a, b)=>a.concat(b), []);

    routes = routes.concat(subRoutes);
    return routes;
  }
  get _routes() {
    const signs = Object.keys(this)
                      .filter(method => method !== 'use')
                      .map(method => Object.keys(this[method]).map(path => [method, path]))
                      .reduce((a, b)=>a.concat(b), []);
    let routes = signs.map(sign => sign.concat(this[sign[0]][sign[1]]));

    const subPaths = Object.keys(this.use);
    const subRoutes = subPaths.map(path => this.use[path]._routes.map(sub => {
      sub[1] = join(path, sub[1]);
      return sub;
    })).reduce((a, b)=>a.concat(b), []);

    routes = routes.concat(subRoutes);
    return routes;
  }
  forExpress() {
    const router = new ExpressRouter();
    const routes = this._routes;
    routes.forEach(route => {
      const method = route[0];
      const path = route[1];
      const action = route[2];
      const options = route[3];

      router[method](path, run(action, options));
    });
    return router;
  }
};
