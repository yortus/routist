// 'use strict';
// import {expect} from 'chai';
// import makePatternMatcher from '../src/make-pattern-matcher';
// 
// 
// describe('unification of a pattern with a pathname', () => {
// 
//     let tests = [
//         '* MATCHES abc',
//         '* DOES NOT MATCH abc/def',
//         '… MATCHES abc',
//         '… MATCHES abc/def',
//         '{name} MATCHES abc WITH { name: "abc" }',
//         '{name} DOES NOT MATCH abc/def',
//         '{...path} MATCHES abc/def WITH { path: "abc/def" }',
//         'aaa MATCHES aaa',
//         'aa DOES NOT MATCH aaa',
//         '…bbb MATCHES bbb',
//         '…bbb MATCHES aaa/bbb',
//         '…bbb DOES NOT MATCH bbbabb',
//         '{x}/y MATCHES x/y WITH {x: "x"}',
//         '/foo/* DOES NOT MATCH /foo',
//         '/foo/* MATCHES /foo/bar',
//         '/… MATCHES /foo/bar',
//         '/{...path} MATCHES /foo/bar WITH { path: "foo/bar" }',
//         '*ab* MATCHES aaabbb',
//         '*aaa* MATCHES aaabbb',
//         '*aaa* MATCHES aaaaaa',
//         '*bbb* MATCHES aaabbb',
//         '*bbb* DOES NOT MATCH bb/baaabb',
//         '/{lhs}/bbb/{...rhs} MATCHES /aaa/bbb/ccc/ddd WITH {lhs: "aaa", rhs: "ccc/ddd"}',
//         '{lhs}/bbb/{...rhs} DOES NOT MATCH /aaa/bbb/ccc/ddd',
//         '/f*o/bar/{baz}z/{...rest}.html MATCHES /foo/bar/baz/some/more/stuff.html WITH { baz: "ba", rest: "some/more/stuff" }'
//     ];
// 
//     tests.forEach(test => {
//         it(test, () => {
//             let isMatch = test.indexOf(' MATCHES ') !== -1;
//             let split = isMatch ? ' MATCHES ' : ' DOES NOT MATCH ';
//             let pattern = test.split(split)[0];
//             let rhs = test.split(split)[1];
//             let pathname = isMatch ? rhs.split(' WITH ')[0] : rhs;
//             let expectedCaptures = isMatch ? eval(`(${rhs.split(' WITH ')[1]})`) || {} : null;
//             let matchPattern = makePatternMatcher(pattern);
//             let actualCaptures = matchPattern(pathname);
//             expect(actualCaptures).to.deep.equal(expectedCaptures);
//             if (!isMatch) return;
// 
//             // Check matchFunc.captureNames too.
//             let expectedCaptureNames = Object.keys(expectedCaptures);
//             let actualCaptureNames = matchPattern.captureNames;
//             expect(actualCaptureNames).to.include.members(expectedCaptureNames);
//             expect(expectedCaptureNames).to.include.members(actualCaptureNames);
//         });
//     });
// });
//# sourceMappingURL=make-pattern-matcher.js.map