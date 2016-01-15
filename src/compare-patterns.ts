'use strict';
import intersectPatterns from './intersect-patterns';


/**
 * Computes the relationship between `patternA` and `patternB` in terms of the sets
 * of pathnames each one matches. The possible relations are:
 * - 1 (Equal): both patterns match the same set of pathnames
 * - 2 (Subset): every pathname matched by `patternA` is also matched by `patternB`
 * - 3 (Superset): every pathname matched by `patternB` is also matched by `patternA`
 * - 4 (Disjoint): no pathname is matched by both `patternA` and `patternB`
 * - 5 (Overlapping): none of the other four relationships are true.
 *
 * NB: `patternA` and `patternB` are assumed to be in normal form.
 * NB: The operation is case-sensitive.
 */
export default function comparePatterns(patternA: string, patternB: string): PatternRelation {
    if (patternA === patternB) {
        return PatternRelation.Equal;
    }
    switch (intersectPatterns(patternA, patternB)) {
        case '∅': return PatternRelation.Disjoint;
        case patternA: return PatternRelation.Subset;
        case patternB: return PatternRelation.Superset;
        default: return PatternRelation.Overlapping;
    }
}


/** Enumeration for classifying the relationship between two RoutePattern instances. */
export const enum PatternRelation {
    Equal = 1,
    Subset = 2,
    Superset = 3,
    Disjoint = 4,
    Overlapping = 5
}
