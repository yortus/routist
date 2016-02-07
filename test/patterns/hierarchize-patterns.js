// 'use strict';
// import {expect} from 'chai';
// import hierarchizePatterns from '../../src/patterns/hierarchize-patterns';
// import {Graph} from '../../src/util';
// import Pattern from '../../src/patterns/pattern';
// 
// 
// describe('Hierarchizing a set of patterns', () => {
// 
//     let tests = [
//         {
//             // ======================================== 1. ========================================
//             name: 'simple tree',
//             patterns: [
//                 '/**',
//                 '/foo/*',
//                 '/bar/*',
//                 '/foo/bar'
//             ],
//             hierarchy: {
//                 "…": {
//                     "/…": {
//                         "/foo/*": {
//                             "/foo/bar": {}
//                         },
//                         "/bar/*": {}
//                     }
//                 }
//             }
//         },
//         {
//             // ======================================== 2. ========================================
//             name: 'impossible intersections',
//             patterns: [
//                 '**',
//                 'a*',
//                 '*a',
//             ],
//             hierarchy: 'ERROR: Intersection of *a and a* cannot be expressed as a single pattern...'
//         },
//         {
//             // ======================================== 3. ========================================
//             name: 'complex DAG',
//             patterns: [
//                 'a*',
//                 '*m*',
//                 '*z',
//                 '**',
//                 '/bar',
//                 '/*',
//                 '/foo',
//                 '/foo/*.html',
//                 '/…o…o….html',
//                 '/**o**o**',
//                 '/bar',
//                 'a*',
//                 '/a/*',
//                 '/*/b',
//                 '/*z/b',
//             ],
//             hierarchy: {
//                 "…": {
//                     "a*": {
//                         "a*m*": {
//                             "a*m*z": {}
//                         },
//                         "a*z": {
//                             "a*m*z": {}
//                         }
//                     },
//                     "*m*": {
//                         "a*m*": {
//                             "a*m*z": {}
//                         },
//                         "*m*z": {
//                             "a*m*z": {}
//                         }
//                     },
//                     "*z": {
//                         "a*z": {
//                             "a*m*z": {}
//                         },
//                         "*m*z": {
//                             "a*m*z": {}
//                         }
//                     },
//                     "/*": {
//                         "/bar": {},
//                         "/*o*o*": {
//                             "/foo": {},
//                             "/*o*o*.html": {}
//                         }
//                     },
//                     "/…o…o…": {
//                         "/*o*o*": {
//                             "/foo": {},
//                             "/*o*o*.html": {}
//                         },
//                         "/…o…o….html": {
//                             "/*o*o*.html": {},
//                             "/foo/*.html": {},
//                             "/a/*o*o*.html": {}
//                         },
//                         "/a/*o*o*": {
//                             "/a/*o*o*.html": {}
//                         },
//                         "/*o*o*/b": {
//                             "/*o*o*z/b": {}
//                         }
//                     },
//                     "/a/*": {
//                         "/a/*o*o*": {
//                             "/a/*o*o*.html": {}
//                         },
//                         "/a/b": {}
//                     },
//                     "/*/b": {
//                         "/*o*o*/b": {
//                             "/*o*o*z/b": {}
//                         },
//                         "/a/b": {},
//                         "/*z/b": {
//                             "/*o*o*z/b": {}
//                         }
//                     },
//                     "/*z/b": {
//                         "/*o*o*z/b": {}
//                     }
//                 }
//             }
//         }
//     ];
// 
//     tests.forEach(test => {
//         it(test.name, () => {
//             let patterns = test.patterns.map(ps => new Pattern(ps));
//             let expected: any = test.hierarchy;
//             let actual: any;
//             try {
//                 actual = mapToObj(hierarchizePatterns(patterns));
//             }
//             catch (ex) {
//                 actual = 'ERROR: ' + ex.message;
//                 if (typeof expected === 'string' && expected.slice(-3) === '...') {
//                     actual = actual.slice(0, expected.length - 3) + '...';
//                 }
//             }
//             expect(actual).deep.equal(expected);
//         });
//     });
// });
// 
// 
// /** Helper function that converts a Graph<Pattern> to a simple nested object with pattern sources for keys */
// function mapToObj(map: Graph<any>) {
//     let patterns = Array.from(map.keys());
//     return patterns.reduce((obj, pat) => (obj[pat.source] = mapToObj(map.get(pat)), obj), {});
// }
//# sourceMappingURL=hierarchize-patterns.js.map