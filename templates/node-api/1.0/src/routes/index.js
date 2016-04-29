'use strict';

module.exports = function(router) {
  router.use('/user', require('./user.js'));
};
