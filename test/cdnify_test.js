'use strict';

var fs = require('fs');

var read = function (name) {
  return fs.readFileSync(name).toString();
};

exports.embed = {
  setUp: function (done) {
    done();
  },

  'Plain CSS file': function (test) {
    var actual, expected;
    test.expect(1);
    actual = read('test/output/sample.css');
    expected = read('test/expected/sample.css');
    test.equal(actual, expected);
    test.done();
  },

  'HTML file including embedded CSS': function (test) {
    var actual, expected;
    test.expect(1);
    actual = read('test/output/sample.html');
    expected = read('test/expected/sample.html');
    test.equal(actual, expected);
    test.done();
  },

  'HTML file including embedded CSS, with custom options': function (test) {
    var actual, expected;
    test.expect(1);
    actual = read('test/output/sample-custom-options.html');
    expected = read('test/expected/sample-custom-options.html');
    test.equal(actual, expected);
    test.done();
  }
};
