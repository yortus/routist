'use strict';
var chai_1 = require('chai');
var get_function_parameters_1 = require('../../src/handlers/get-function-parameters');
describe(`Identifying a function's formal parameters`, () => {
    let tests = [
        `function () {} ==> `,
        `function (a) {} ==> a`,
        `function (foo,    bar,baz) {} ==> foo,bar,baz`,
        `function (aAA, bBb) {} ==> aAA,bBb`,
        `function fn() {} ==> `,
        `function fn(a) {} ==> a`,
        `function fn(foo,    bar,baz) {} ==> foo,bar,baz`,
        `function fn(aAA, bBb) {} ==> aAA,bBb`,
        `function (aAA, bBb, ...rest) {} ==> ERROR: ...`,
        `function \n\n\n   (   foo\n, bar/*,baz*/) {} ==> foo,bar`,
        `function (foo) { return function (bar) {}; } ==> foo`,
        `() => {} ==> `,
        `() => null ==> `,
        `(a) => {} ==> a`,
        `(a) => Date ==> a`,
        `foo => {} ==> foo`,
        `foo => Date ==> foo`,
        `(foo,    bar,baz) => {} ==> foo,bar,baz`,
        `(aAA, bBb) => {} ==> aAA,bBb`,
        `(aAA, bBb, ...rest) => {} ==> ERROR: ...`,
        `(\n   foo\n, bar/*,baz*/) => {} ==> foo,bar`,
        `(foo) => { return function (bar) {}; } ==> foo`,
        `Date => { return function (bar) {}; } ==> Date`,
        `foo => bar => null ==> foo`,
        `function* () {} ==> `,
        `function* (a) {} ==> a`,
        `function  * (foo,    bar,baz) {} ==> foo,bar,baz`,
        `function* (aAA, bBb) {} ==> aAA,bBb`,
        `function *fn() {} ==> `,
        `function  *fn(a) {} ==> a`,
        `function* fn(foo,    bar,baz) {} ==> foo,bar,baz`,
        `function * fn(aAA, bBb) {} ==> aAA,bBb`,
        // Currently unsupported in any Node version: default values, destructuring, async functions
        // TODO: what to do when *some* Node versions support these? Disable tests?
        //       Disable test if eval errors? (but that will mask erroneous test cases too)
        `function (foo = 'foo', bar) {} ==> ERROR: Unexpected token...`,
        `function (foo='foo', bar     =      99) {} ==> ERROR: Unexpected token...`,
        `function (foo = 'foo', bar = 99) {} ==> ERROR: Unexpected token...`,
        `function (foo, bar = {foo:'bar'}) {} ==> ERROR: Unexpected token...`,
        `function loop({ start=0, end=-1, step=1 }) {} ==> ERROR: Unexpected token...`,
        `async function fn(foo,   bar) {} ==> ERROR: Unexpected token...`,
        `async (foo,   bar) => {} ==> ERROR: Unexpected token...`
    ];
    tests.forEach(test => {
        it(test, () => {
            let funcSource = test.split(' ==> ')[0];
            let expectedParamNames = test.split(' ==> ')[1];
            let actualParamNames;
            try {
                let func = eval(`(${funcSource})`);
                actualParamNames = get_function_parameters_1.default(func).toString();
            }
            catch (ex) {
                actualParamNames = 'ERROR: ' + ex.message;
                if (expectedParamNames.slice(-3) === '...') {
                    actualParamNames = actualParamNames.slice(0, expectedParamNames.length - 3) + '...';
                }
            }
            chai_1.expect(actualParamNames).equals(expectedParamNames);
        });
    });
});
//# sourceMappingURL=get-function-parameters.js.map