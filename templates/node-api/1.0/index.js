'use strict';

// initialize
require('./bin/load_schemas.js');
require('./bin/load_models.js');
require('./bin/load_services.js');

// start server
require('./src/server/index');
