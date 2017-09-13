/**
 * Integration tests
 * @module test/integration
 */

const hippie = require('hippie');
const server = require('../../../main/js/server');
const fs = require('fs');

let tokens = {
};

// start the server listening now

// we'll turn off tls checking so that our self-signed certificate
// can make it through on these requests
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function _api(user) {

    let test = hippie(server)
        .timeout(10000)
        .json()
        .use((options, next) => {
            options.strictSSL = false;
            next(options);
        })
        .base("http://localhost:3002/");

    if (user) { 
        test = test.header('Authorization', `Bearer ${tokens[user]}`);
        test = test.header('Content-Type', 'application/json');
    }

    return test;

}

function endAndRestore(err, done, stub) {
    if (stub) {
        stub.restore();
    }
    if (err) {
        throw err;
    }
    done();
}

module.exports = {
    endAndRestore,
    api: _api
};