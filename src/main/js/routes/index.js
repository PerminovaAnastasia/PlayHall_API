'use strict';

/**
 * Routing module
 * @module routes
 */
/*jshint -W071*/
module.exports = function (server, mw) {
  /**
   * Version endpoints
   *
   **/
  let version = require('./version');
  server.get("/version", version.version);


  /**
   * User endpoints
   *
   **/
  let user = require('./user');
  server.post("/user/authenticate", user.authenticate);
  // server.get("/user/friends", mw.auth, mw.assertPerm("play"), user.getFriends);
  // server.post("/user/friend/:nickname", mw.auth, mw.assertPerm("play"), user.addFriend);

};
/*jshint +W071*/