'use strict';

const Q = require('q');
const factory = require('../factory.js');
const FB = factory.FB;


module.exports = {

  authenticate : function (token) {

      return Q.Promise((resolve, reject) => {
        FB.setAccessToken(token);

        FB.api("me?fields=email,name,picture", result => {
          if (!result || result.error) {
            reject(result.error);
          }
          else {
            let user = {
              role: 'player',
              perms: ['play'],
              avatar: result.picture.data.url,
              email: result.email, //todo emails
              auth: {
                facebook: {
                  id: result.id,
                  token: token,
                  timestamp: +new Date()
                }
              },
              names: [
                result.name.split(/(\s+)/)[0],
                result.name.split(/(\s+)/)[2]
              ]
            };

            resolve(user);
          }
        });
      });
  }
};