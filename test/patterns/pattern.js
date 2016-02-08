// 'use strict';
// import {expect} from 'chai';
// import Pattern from '../../src/patterns/pattern';
// 
// 
// describe('Constructing a Pattern instance', () => {
// 
//     let tests = [
//         '/api/foo ==> /api/foo WITH []',
//         '/api/foo/BAR ==> /api/foo/BAR WITH []',
//         '/api/foo… ==> /api/foo… WITH []',
//         '/api/foo** ==> /api/foo… WITH []',
//         '/api/foo/** ==> /api/foo/… WITH []',
//         '/api/foo/{...rest} ==> /api/foo/… WITH ["rest"]',
//         '/API/f*## ==> /API/f* WITH []',
//         '/api/{foO}O ==> /api/*O WITH ["foO"]',
//         '/…/{name}.{ext} ==> /…/*.* WITH ["name", "ext"]',
//         '/**/{name}.{ext} ==> /…/*.* WITH ["name", "ext"]',
//         '/{...aPath}/{name}.{ext} ==> /…/*.* WITH ["aPath", "name", "ext"]',
//         '/-/./- ==> /-/./-',
//         '/*** ==> ERROR',
//         '/*… ==> ERROR',
//         '/foo/{...rest}* ==> ERROR',
//         '/foo/{name}{ext} ==> ERROR',
//         '/$foo ==> ERROR',
//         '/bar/? ==> ERROR',
//         '{} ==> ERROR',
//         '{a...} ==> ERROR',
//         '{...} ==> ERROR',
//         '{..} ==> ERROR',
//         '{..a} ==> ERROR',
//         '{foo-bar} ==> ERROR',
//         '{"foo"} ==> ERROR',
//         '{ ==> ERROR',
//         '} ==> ERROR',
//         '{{} ==> ERROR',
//         '{}} ==> ERROR',
//         '{$} ==> * WITH ["$"]',
//         '{...__} ==> … WITH ["__"]',
//         '#comment ==> ',
//         '   #comment ==> ',
//         '# /a/b/c   fsdfsdf ==> ',
//         '/a/b#comment ==> /a/b',
//         '/**/{name}.js   #12 ==> /…/*.js WITH ["name"]',
//     ];
// 
//     tests.forEach(test => {
//         it(test, () => {
//             let patternSource = test.split(' ==> ')[0];
//             let rhs = test.split(' ==> ')[1];
//             let expectedSignature = rhs.split(' WITH ')[0];
//             let expectedCaptureNames = eval(rhs.split(' WITH ')[1] || '[]');
//             let expectedComment = patternSource.split('#')[1] || '';
//             let actualSignature = 'ERROR';
//             let actualCaptureNames = [];
//             let actualComment = '';
//             try {
//                 let pattern = new Pattern(patternSource);
//                 actualSignature = pattern.normalized.toString();
//                 actualCaptureNames = pattern.captureNames;
//                 actualComment = pattern.comment;
//             }
//             catch (ex) { }
//             expect(actualSignature).equals(expectedSignature);
//             expect(actualCaptureNames).to.deep.equal(expectedCaptureNames);
//             expect(actualComment).equals(expectedComment);
//         });
//     });
// });
// 
// 
// describe('Comparing patterns with their normalized forms', () => {
//     let patterns = [
//         '/*/bar/{...baz}',
//         '/*/bar/…',
//         '/{n}/bar/**',
//         '/{__}/bar/{...baz}'
//     ];
// 
//     patterns.forEach(a1 => {
//         let p1 = new Pattern(a1);
//         it(`'${a1}' vs normalised`, () => {
//             expect(a1 === p1.normalized.toString()).equals(p1 === p1.normalized);
//         });
// 
//         patterns.forEach(a2 => {
//             let p2 = new Pattern(a2);
//             it(`'${a1}' vs '${a2}'`, () => {
//                 expect(p1.normalized).equals(p2.normalized);
//             });
//         });
//     });
// });
//# sourceMappingURL=pattern.js.map