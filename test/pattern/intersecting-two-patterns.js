// 'use strict';
// import {expect} from 'chai';
// import Pattern from '../../src/pattern';
// 
// 
// describe('Intersecting two patterns', () => {
// 
//     let tests = [
//         '… ∩ ∅ = ∅',
//         ' ∩ ∅ = ∅',
//         'a ∩ ∅ = ∅',
//         '∅ ∩ ∅ = ∅',
//         '∅ ∩ a = ∅',
//         '∅ ∩  = ∅',
//         '∅ ∩ * = ∅',
//         '∅ ∩ … = ∅',
//         '* ∩ ∅∅ = ERROR',
// 
//         '/ab* ∩ /*b = ERROR',
//         '/f*o*o*z ∩ /foo*baz = /foo*baz',
//         '/*/f*o*o*baz ∩ /aaa/foo*z = /aaa/foo*baz',
//         '/ab*b ∩ /a*bc = ∅',
//         '/ab*b ∩ /a*bc* = ERROR',
//         '/a*b ∩ /ab*ab = /ab*ab',
//         '/a*b ∩ /ba*ab = ∅',
//         '/*m*n* ∩ /*n*m* = ERROR',
//         '/*m*n* ∩ /*n*m*n* = /*n*m*n*',
//         '/ ∩ / = /',
//         '/ ∩ /* = /',
//         '/* ∩ /* = /*',
//         '/* ∩ / = /',
//         '/f ∩ / = ∅',
//         '/ ∩ /f = ∅',
// 
//         '/a/b ∩ /* = ∅',
//         '/a/b ∩ /*/*c* = ∅',
//         '/a/*b ∩ /*/*c* = /a/*c*b',
//         '/a/*b ∩ /*/*c*/* = ∅',
//         '/foo/* ∩ /*/bar = /foo/bar',
// 
//         '/a/b ∩ /… = /a/b',
//         '/a/b ∩ … = /a/b',
//         '/ ∩ … = /',
//         ' ∩ … = ',
//         '….html ∩ … = ….html',
//         '/foo/….html ∩ … = /foo/….html',
//         '/foo/….html ∩ /foo/bar/*z/* = /foo/bar/*z/*.html',
//         '/foo/….html ∩ /foo/bar/*z/… = /foo/bar/*z/….html',
// 
//         '/* ∩ /… = /*',
//         '/*/* ∩ /… = /*/*',
//         '/… ∩ /… = /…',
//         '/… ∩ /*/* = /*/*',
//         '/…/* ∩ /… = /…/*',
//         '/*/… ∩ /… = /*/…',
//         '/… ∩ /…/* = /…/*',
//         '/… ∩ /*/… = /*/…',
//         '/*/…/* ∩ /… = /*/…/*',
//         '*/… ∩ …/* = ERROR',
//         '*… ∩ …* = ERROR',
//         'a… ∩ …a = ERROR',
//         '*a… ∩ …a* = ERROR',
//         '…a* ∩ *a… = ERROR',
//         '…a* ∩ *z… = ERROR', // *a*z*, *z…a*
//         '*z… ∩ …a* = ERROR', // *a*z*, *z…a*
//         '*z* ∩ *a* = ERROR', // *a*z*, *z*a*
//         'a*… ∩ …*a = ERROR',
//         'a…* ∩ *…a = ERROR',
//         'a* ∩ *a = ERROR',
//         'a/… ∩ …/a = ERROR',
// 
//         '/o… ∩ /*z = /o*z',
//         '/o…o… ∩ /*z = /o*o*z',
//         '/o…o… ∩ /*z/b = /o*o*z/b',
//         '/…o…o… ∩ /*z/b = /*o*o*z/b'
//     ];
// 
//     tests.forEach(test => {
//         it(test, () => {
//             let lhsA = test.split(' = ')[0].split(' ∩ ')[0];
//             let lhsB = test.split(' = ')[0].split(' ∩ ')[1];
//             let rhs = test.split(' = ')[1];
//             let actual: string, expected = rhs;
//             try {
//                 actual = 'ERROR';
//                 actual = new Pattern(lhsA).intersect(new Pattern(lhsB)).toString();
//             }
//             catch(ex) { }
//             expect(actual).equals(expected);
//         });
//     });
// });
//# sourceMappingURL=intersecting-two-patterns.js.map