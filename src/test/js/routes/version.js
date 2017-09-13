'use strict';

const chai = require('chai');
const assert = chai.assert;
const common = require('./common');
const packageJson = require('../../../../package.json');
const endAndRestore = common.endAndRestore;

describe("url validation", function() {

    it("Checks Url", (done) => {
        common.api("user")
            .get('/version')
            .expectStatus(200)
            .end((err, res, body) => {
                assert.equal(packageJson.version, body.version);
                endAndRestore(err, done);
            });
    });

});
