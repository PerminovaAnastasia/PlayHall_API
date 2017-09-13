
const expect = require('chai').expect;

const somethingToTest = function (valueIn) {
  return valueIn;
};

describe('#unit tests', function() {

  it('#somethingToTest', function(done) {
    expect(somethingToTest('hello')).is.eq('hello');
    done();
  });

  //require necessary tests
});

