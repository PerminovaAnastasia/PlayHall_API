'use strict';

const profanity = require('profanity-util');

/**
 * Checks a string for profanity, including all substrings
 * @param {string} string - string to check
 * */
function checkStringForProfanity(string) {
  return profanity.check(string, { substrings: true }).length > 0;
}

module.exports = {
  checkStringForProfanity,
};