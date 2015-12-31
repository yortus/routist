'use strict';
var parser = require('./route-pattern-dsl');
var parse = parser.parse;
// TODO: doc...
class RoutePattern {
    constructor(pattern) {
        let ast = parse(pattern); // TODO: wrap thrown errors
        this.canonical = ast.canonical;
        this.captureNames = ast.captureNames;
    }
    intersectWith(other) {
        let allIntersections = getAllIntersections(this.canonical, other.canonical);
        let distinctIntersections = getDistinctPatterns(allIntersections);
        if (distinctIntersections.length === 0)
            return RoutePattern.NEVER_MATCH;
        // TODO: how to handle multiple matches? throw? return NEVER_MATCH?
        if (distinctIntersections.length >= 2)
            return RoutePattern.NEVER_MATCH;
        return new RoutePattern(distinctIntersections[0]);
    }
    //TODO: method to match against pathname...
    toString() {
        return this.canonical;
    }
}
//TODO: review...
/** Sentinel value for a pattern that matches all URLs. */
RoutePattern.ALWAYS_MATCH = { canonical: '…', toString: () => '…' }; // U+2026 HORIZONTAL ELLIPSIS
/** Sentinel value for a pattern that matches no URLs. */
RoutePattern.NEVER_MATCH = { canonical: '∅', toString: () => '∅' }; // U+2205 EMPTY SET
/**
 * Returns a subset of the given list of patterns, such that no pattern in the
 * resulting list is a (proper or improper) subset of any other pattern in the list.
 */
function getDistinctPatterns(patterns) {
    // Set up a parallel array to flag which patterns are distinct. Start by assuming they all are.
    let isDistinct = patterns.map(u => true);
    // Compare all patterns pairwise, discarding those that are (proper or improper) subsets of another.
    for (let i = 0; i < patterns.length; ++i) {
        if (!isDistinct[i])
            continue;
        let subsetRecogniser = makeSubsetRecogniser(patterns[i]);
        for (let j = 0; j < patterns.length; ++j) {
            if (i === j || !isDistinct[j])
                continue;
            isDistinct[j] = !subsetRecogniser.test(patterns[j]);
        }
    }
    // Return only the distinct patterns from the original list.
    return patterns.filter((_, i) => isDistinct[i]);
}
/**
 * Returns a regular expression that matches all pattern strings
 * that are (proper or improper) subsets of `pattern`.
 */
function makeSubsetRecogniser(pattern) {
    let re = pattern.split('').map(c => {
        if (c === '*')
            return '[^\\/…]*';
        if (c === '…')
            return '.*';
        if (['/._-'].indexOf(c) !== -1)
            return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
/**
 * Computes all patterns that may be formed by unifying wildcards from
 * one pattern with substitutable substrings of the other pattern such that
 * all characters from both patterns are present and in order in the result.
 * All the patterns computed in this way represent valid intersections of A
 * and B, however some may be duplicates or subsets of others.
 */
function getAllIntersections(a, b) {
    // An empty pattern intersects only with another empty pattern or a single wildcard.
    if (a === '' || b === '') {
        let other = a || b;
        return other === '' || other === '*' || other === '…' ? [''] : [];
    }
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {
        return getAllPatternSplits(b)
            .filter(pair => a[0] === '…' || (!pair[0].includes('/') && !pair[0].includes('…')))
            .map(pair => getAllIntersections(a.slice(1), pair[1]).map(u => pair[0] + u))
            .reduce((ar, el) => (ar.push.apply(ar, el), ar), []);
    }
    else if (b[0] === '…' || b[0] === '*') {
        return getAllIntersections(b, a);
    }
    else if (a[0] === b[0]) {
        return getAllIntersections(a.slice(1), b.slice(1)).map(u => a[0] + u);
    }
    // The intersection of A and B is empty.
    return [];
}
/**
 * Returns an array of all the [prefix, suffix] pairs into which `pattern` may be split.
 * Splits that occur on a wildcard character have the wildcard on both sides of the split
 * (i.e. as the last character of the prefix and the first character of the suffix).
 * E.g., 'ab*c' splits into ['', 'ab*c'], ['a', 'b*c'], ['ab*', '*c'], and ['ab*c', ''].
 */
function getAllPatternSplits(pattern) {
    let result = [];
    for (let i = 0; i <= pattern.length; ++i) {
        let pair = [pattern.substring(0, i), pattern.substring(i)];
        if (pattern[i] === '*' || pattern[i] === '…') {
            pair[0] += pattern[i];
            ++i; // skip next iteration
        }
        result.push(pair);
    }
    return result;
}
module.exports = RoutePattern;
//# sourceMappingURL=route-pattern.js.map