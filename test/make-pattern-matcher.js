'use strict';
var chai_1 = require('chai');
var make_pattern_matcher_1 = require('../src/make-pattern-matcher');
describe('unification of a pattern with a pathname', () => {
    let tests = [
        '/foo/* DOES NOT MATCH /foo',
        '/foo/* MATCHES /foo/bar WITH {}',
        '/… MATCHES /foo/bar WITH {}',
        '/{...path} MATCHES /foo/bar WITH { path: "foo/bar" }',
        '/f*o/bar/{baz}z/{...rest}.html MATCHES /foo/bar/baz/some/more/stuff.html WITH { baz: "ba", rest: "some/more/stuff" }'
    ];
    tests.forEach(test => {
        it(test, () => {
            let isMatch = test.indexOf(' MATCHES ') !== -1;
            let split = isMatch ? ' MATCHES ' : ' DOES NOT MATCH ';
            let pattern = test.split(split)[0];
            let rhs = test.split(split)[1];
            let pathname = isMatch ? rhs.split(' WITH ')[0] : rhs;
            let expectedCaptures = isMatch ? eval(`(${rhs.split(' WITH ')[1]})`) : null;
            let matchPattern = make_pattern_matcher_1.default(pattern);
            let actualCaptures = matchPattern(pathname);
            chai_1.expect(actualCaptures).to.deep.equal(expectedCaptures);
            if (!isMatch)
                return;
            // Check matchFunc.captureNames too.
            let expectedCaptureNames = Object.keys(expectedCaptures);
            let actualCaptureNames = matchPattern.captureNames;
            chai_1.expect(actualCaptureNames).to.include.members(expectedCaptureNames);
            chai_1.expect(expectedCaptureNames).to.include.members(actualCaptureNames);
        });
    });
});
//# sourceMappingURL=make-pattern-matcher.js.map