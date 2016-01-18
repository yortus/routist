// 'use strict';
// import {expect} from 'chai';
// import comparePatterns, {PatternRelation as Relation} from '../src/compare-patterns';
// import normalizePattern from '../src/normalize-pattern';
// 
// 
// describe('comparison of two pattern strings', () => {
// 
//     let tests = [
//         '/ab* vs /ab*: Equal',
//         '/ab* vs /*b: ERROR',
//         '/ab* vs /abc*: Superset',
//         '/f*o/**/{name}.html vs /f*/{...rest}: Subset',
//         '/ab* vs /xy*: Disjoint',
//         '/ab* vs /*xy: Overlapping',
//         '… vs /foo/bar: Superset',
//         '… vs /*/bar/…: Superset',
//         '… vs …: Equal',
//         '… vs ∅: Superset',
//         '∅ vs /foo/bar: Subset',
//         '∅ vs /*/bar/…: Subset',
//         '∅ vs …: Subset',
//         '∅ vs ∅: Equal',
//         '/foo/bar vs …: Subset',
//         '/*/bar/… vs …: Subset',
//         '/foo/bar vs ∅: Superset',
//         '/*/bar/… vs ∅: Superset',
//     ];
// 
//     let relMap = {
//         [Relation.Equal]: 'Equal',
//         [Relation.Superset]: 'Superset',
//         [Relation.Subset]: 'Subset',
//         [Relation.Disjoint]: 'Disjoint',
//         [Relation.Overlapping]: 'Overlapping'
//     };
// 
//     tests.forEach(test => {
//         it(test, () => {
//             let expected = test.split(': ')[1];
//             let lhs = test.split(': ')[0].split(' vs ')[0];
//             let rhs = test.split(': ')[0].split(' vs ')[1];
//             let actual: string;
//             try {
//                 actual = 'ERROR';
//                 let a = normalizePattern(lhs);
//                 let b = normalizePattern(rhs);
//                 actual = relMap[comparePatterns(a, b)];
//             }
//             catch(ex) { }
//             expect(actual).equals(expected);
//         });
//     });
// });
//# sourceMappingURL=compare-patterns.js.map