'use strict';

const services = require('../services');

module.exports = function(router) {
  router.get('/:id', services.user.getUser);
};
