// 'use strict';
// import {expect} from 'chai';
// import makePatternMatcher from '../src/make-pattern-matcher';
// 
// 
// describe('matching a pattern against a pathname', () => {
// 
//     let tests = [
//         '/foo/* DOES NOT MATCH /foo',
//         '/foo/* MATCHES /foo/bar WITH {}',
//         '/… MATCHES /foo/bar WITH {}',
//         '/{...path} MATCHES /foo/bar WITH { path: "foo/bar" }',
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
//             let expectedCaptures = isMatch ? eval(`(${rhs.split(' WITH ')[1]})`) : null;
//             let matchPattern = makePatternMatcher(pattern);
//             let actualCaptures = matchPattern(pathname);
//             expect(actualCaptures).to.deep.equal(expectedCaptures);
//         });
//     });
// });
