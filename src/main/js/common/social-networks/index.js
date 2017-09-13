'use strict';

/**
 * @class SocialNetwork
 * @method authenticate
 * @method getFriends
 * */

module.exports = {
  "google": require('./google'),
  "facebook": require('./facebook'),
};