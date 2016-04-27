'use strict';

const config = require('./config');

module.exports = require('redis').createClient(config.cache.port, config.cache.host);
