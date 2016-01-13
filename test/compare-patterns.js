'use strict';
var chai_1 = require('chai');
var compare_patterns_1 = require('../src/compare-patterns');
var normalize_pattern_1 = require('../src/normalize-pattern');
describe('comparison of two pattern strings', () => {
    let tests = [
        '/ab* vs /ab*: Equal',
        '/ab* vs /*b: ERROR',
        '/ab* vs /abc*: Superset',
        '/f*o/**/{name}.html vs /f*/{...rest}: Subset',
        '/ab* vs /xy*: Disjoint',
        '/ab* vs /*xy: Overlapping'
    ];
    let relMap = {
        [1 /* Equal */]: 'Equal',
        [3 /* Superset */]: 'Superset',
        [2 /* Subset */]: 'Subset',
        [4 /* Disjoint */]: 'Disjoint',
        [5 /* Overlapping */]: 'Overlapping'
    };
    tests.forEach(test => {
        it(test, () => {
            let expected = test.split(': ')[1];
            let lhs = test.split(': ')[0].split(' vs ')[0];
            let rhs = test.split(': ')[0].split(' vs ')[1];
            let actual;
            try {
                actual = 'ERROR';
                let a = normalize_pattern_1.default(lhs);
                let b = normalize_pattern_1.default(rhs);
                actual = relMap[compare_patterns_1.default(a, b)];
            }
            catch (ex) { }
            chai_1.expect(actual).equals(expected);
        });
    });
});
//# sourceMappingURL=compare-patterns.js.map