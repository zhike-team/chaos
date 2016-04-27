'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('chaos_user', {
      id: {
        type: 'serial',
        primaryKey: true
      },
      name: 'varchar(128)',
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('chaos_user');
  }
};
