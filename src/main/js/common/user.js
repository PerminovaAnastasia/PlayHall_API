'use strict';

/**
 * User adapter class
 * @module user.js
 * 
 * Acts as a lense into more complex user objects to easily present
 * information important to Firstmac processing
 */

const Q       = require('q'),
      _       = require('lodash'),
      jwt     = require('restify-jwt'),
      restifyErrors = require('restify-errors');

let anonymousUserData = {
  "family_name": "Anonymous",
  "given_name": "Anonymous",
  "name": null
};

let UserAdapter = function (userData) {
  let self = this;

  self.userData = userData || anonymousUserData;

  self.nickname = () => self.userData !== null && self.userData.nickname;

  /**
   * Determines if the user is anonymous
   * @func isAnonymous
   * @returns Boolean
   */
  self.isAuthenticated = () => self.userData !== null && self.userData !== anonymousUserData;

  /**
   * Retrieves a list of assertable permissions for the user
   * @func getPerms
   * @returns {Promise} Returning an array of roles
   */
  self.getPerms = () => {
    return self.userData.user.perms;
  };

  /**
   * Asserts a single or array of permissions
   * @func assertPermission
   * @param perms {String|Array}
   */
  self.assertPermission = function (perms) {

    // TODO avoid using promise
    return Q.Promise((resolve, reject) => {

      if (typeof perms === 'string') {
        perms = [perms];
      } else if (!Array.isArray(perms)) {
        return reject(new Error('No permissions were specified to assert'));
      }

      if (_.difference(perms, self.getPerms()).length > 0) {
        return reject(
          new restifyErrors.NotAuthorizedError({
            message: 'User did not assert the required permissions',
            context: { perms: perms }
          })
        );
      }

      return resolve(true);
    });

  };

  /**
   * Asserts a dictionary of object access requests for this user
   * @func assertObjectAccess
   * @param config {Object} The access to assert
   * @returns Promise[bool]
   */
  self.assertObjectAccess = function (config) {

    return Q.Promise((resolve, reject) => {

      if (!config) {
        return reject(new Error('No objects were specified to assert'));
      }

      return resolve(true);
    });
  };
};

/** Sets up the user adapter to operate on incoming user data
  * @func _setupAdapter
  * @param req {Object} Incoming request object
  * @param res {Object} Outgoing response object
  * @param next {Function} Next function in middleware chain */
function _setupAdapter(req, res, next) {
  req.userAdapter = new UserAdapter(req.user);
  return next();
}

const fs = require('fs');
const signingCertificate = fs.readFileSync('src/main/resources/secrets/signing.cer');

module.exports = {
  UserAdapter: UserAdapter,

  mw: {
    auth:       [ jwt({ secret: signingCertificate }), _setupAdapter ],
    anon:       [ _setupAdapter ],

    /**
     * Asserts application defined permissions against user assinged ones
     *
     * @param perms {String|Array} A string or array of permission names to test
     * @returns {Promise} Permission assertion
     * */
    assertPerm: function (perms) {
      return function _assertPerm(req, res, next) {

        return req.userAdapter.assertPermission(perms)
          .then(next)
          .catch(next)
          .done();

      };
    }
  }
};