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
   * Accounts endpoints
   *
   **/
  let accounts = require('./accounts');
  server.post("/staff/authorize", accounts.authorize);
  server.post("/accounts/currentUser",  mw.auth, accounts.getCurrentUser);

  // server.get("/user/friends", mw.auth, mw.assertPerm("play"), user.getFriends);
  // server.post("/user/friend/:nickname", mw.auth, mw.assertPerm("play"), user.addFriend);

};
/*jshint +W071*/