'use strict';
/* eslint-disable */

const prefix = require('../../common/config').db.prefix;

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(`${prefix}user`, {
      id: {
        type: 'serial',
        primaryKey: true
      },
      name: 'varchar(128)',
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(`${prefix}user`);
  }
};
