'use strict';

const ExpressRouter = require('express').Router;
const join = require('path').join;
const run = require('./run');
const methods = require('methods').concat('all');

module.exports = class Router {
  constructor(configure) {
    methods.forEach(method => {
      this[method] = function(path, actionsAndOptions) {
        actionsAndOptions = Array.from(arguments).slice(1);
        this[method][path] = (this[method][path] || []).concat(actionsAndOptions);
      };
    });
    this.use = function(path, subRouterOrMiddlewares) {
      subRouterOrMiddlewares = Array.from(arguments).slice(1);
      if (subRouterOrMiddlewares.length > 0) {
        if (isGeneratorFunction(subRouterOrMiddlewares[0])) { // middleware
          const middlewares = subRouterOrMiddlewares;
          this.all[path] = (this.all[path] || []).concat(middlewares);
        } else {
          const subRouter = subRouterOrMiddlewares[0];
          if (typeof subRouter === 'function') { // subrouter
            const sub = new Router(subRouter);
            this.use[path] = sub;
          } else {
            this.use[path] = subRouter;
          }
        }
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
      const actionsAndOptions = route.slice(2);
      const actions = route.filter(isGeneratorFunction);
      const action = actions.pop();
      const options = (actions.length < actionsAndOptions) ? actionsAndOptions[actions.length] : null;
      const args = [].concat(path, actions, run(action, options));
      router[method].apply(router, args);
    });
    return router;
  }
};

function isGeneratorFunction(gf) {
  return gf && gf.constructor && gf.constructor.name === 'GeneratorFunction';
}
