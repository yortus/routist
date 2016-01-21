'use strict';
var chai_1 = require('chai');
var is_promise_1 = require('../../src/handlers/is-promise');
describe('Identifying a Promise instance', () => {
    let tests = [
        `T: new Promise(res => {})`,
        `T: Promise.resolve(1)`,
        `T: Promise.reject('error')`,
        `F: null`,
        `F: void 0`,
        `F: 'a string'`,
        `F: 1234`,
        `F: {}`,
        `F: []`,
        `F: ['then']`,
        `F: Promise`,
        `F: {then: null}`,
        `T: {then: () => {}}`,
        `F: {then: {}}`,
        `F: {Then: () => {}}`,
        `T: {Then: () => {}, then: () => {}}`
    ];
    tests.forEach(test => {
        it(test, () => {
            let testVal = eval(`(${test.slice(3)})`);
            let expected = test[0] === 'T' ? true : false;
            let actual = is_promise_1.default(testVal);
            chai_1.expect(actual).equals(expected);
        });
    });
});
//# sourceMappingURL=is-promise.js.map