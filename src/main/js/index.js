'use strict';

const server  = require("./server");
const logger  = require("./common").logger;
const port = require('config').get("port");

// start the server listening now
server.listen(port, () => {
  logger.info(`${server.name} listening at ${server.url}`);
});
