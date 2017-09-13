'use strict';

const server = require('../../../main/js/server');
const logger = require('../../../main/js/common/index').logger;

const port = require('config').get("port");

require('./common');

describe('Client API', () => {

  before((done) => {

    server.listen(port, () => {
      logger.info(`${server.name} listening at ${server.url}`);
      done();
    });

  });

  // TODO: "require" your test modules here
  require('./version');
  require('../unit');
});

