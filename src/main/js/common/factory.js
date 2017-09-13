'use strict';

const config = require('config');
const googleAuth = config.get("googleAuth");
const google = require('googleapis');
const plus = google.plus('v1');
const FB = require('fb');


const _values = {};

function lazy(name, initFunction) {
    return () => {
        if (!_values[name]) {
            _values[name] = initFunction.apply(null, Array.prototype.slice.call(arguments, 1));
        }

        return _values[name];
    };
}


module.exports = {

    googleOauthClient: lazy("googleOauthClient", () => {
        let OAuth2Client = google.auth.OAuth2;
        return new OAuth2Client(googleAuth.clientID,
            googleAuth.clientSecret,
            googleAuth.callbackURL);
    }),

    plus: plus,
    FB: FB,

  socialNetwork: ((type) => {
    return require('./social-networks')[type];
  }),
};