'use strict';
var intersect_patterns_1 = require('./intersect-patterns');
/**
 * Computes the relationship between `patternA` and `patternB` in terms of the sets
 * of pathnames each one matches. The possible relations are:
 * - 1 (Equal): both patterns match the same set of pathnames
 * - 2 (Subset): every pathname matched by `patternA` is also matched by `patternB`
 * - 3 (Superset): every pathname matched by `patternB` is also matched by `patternA`
 * - 4 (Disjoint): no pathname is matched by both `patternA` and `patternB`
 * - 5 (Overlapping): none of the other four relationships are true.
 */
function comparePatterns(patternA, patternB) {
    if (patternA === patternB) {
        return 1 /* Equal */;
    }
    switch (intersect_patterns_1.default(patternA, patternB)) {
        case '∅': return 4 /* Disjoint */;
        case patternA: return 2 /* Subset */;
        case patternB: return 3 /* Superset */;
        default: return 5 /* Overlapping */;
    }
}
exports.default = comparePatterns;
//# sourceMappingURL=compare-patterns.js.map