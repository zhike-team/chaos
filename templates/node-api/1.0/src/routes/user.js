'use strict';

module.exports = function(router) {
  router.get('/:id', services.user.getUser);
}
