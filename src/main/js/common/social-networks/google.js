'use strict';

const Q = require('q');
const factory = require('../factory.js');
const oauth2Client = factory.googleOauthClient();
const plus = factory.plus;

module.exports = {

  authenticate : function (accessToken) {
    {
      /*jshint -W106 */
      oauth2Client.credentials.access_token = accessToken;
      return Q.Promise((resolve, reject) => {
        plus.people.get({userId: 'me', auth: oauth2Client}, function (err, profile) {
          if (err) {
            return reject(err);
          }

          let user = {
            role: 'player',
            perms: ['play'],
            avatar: profile.image.url,
            email: profile.emails[0].value, //TODO emails
            auth: {
              google: {
                id: profile.id,
                accessToken: accessToken,
                timestamp: +new Date()
              }
            },
            names: [
              profile.name.givenName,
              profile.name.familyName
            ]
          };
          /*jshint +W106 */
          resolve(user);
        });
      });
    }
  }

};