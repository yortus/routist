'use strict';
var chai_1 = require('chai');
var util_1 = require('../../src/util');
describe('Identifying a Promise instance', function () {
    var tests = [
        "T: new Promise(res => {})",
        "T: Promise.resolve(1)",
        "T: Promise.reject('error')",
        "F: null",
        "F: void 0",
        "F: 'a string'",
        "F: 1234",
        "F: {}",
        "F: []",
        "F: ['then']",
        "F: Promise",
        "F: {then: null}",
        "T: {then: () => {}}",
        "F: {then: {}}",
        "F: {Then: () => {}}",
        "T: {Then: () => {}, then: () => {}}"
    ];
    tests.forEach(function (test) {
        it(test, function () {
            var testVal = eval("(" + test.slice(3) + ")");
            var expected = test[0] === 'T' ? true : false;
            var actual = util_1.isPromise(testVal);
            chai_1.expect(actual).equals(expected);
        });
    });
});
//# sourceMappingURL=identifying-a-promise-instance.js.map