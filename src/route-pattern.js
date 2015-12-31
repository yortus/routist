'use strict';
var parser = require('./route-pattern-dsl');
/**
 * A RoutePattern matches a particular set of pathnames that conform to a textual pattern.
 */
class RoutePattern {
    /**
     * Creates a new RoutePattern instance from the given pattern string.
     * The pattern string consists of a sequence of the following elements:
     * - literal characters (alphanumerics, underscore, period and hyphen)
     * - globstar captures ('**' or '…' for anonymous capture, or '{...name}' for named capture)
     * - wildcard captures ('*' for anonymous capture, or '{name}' for named capture)
     * - path separator ('/')
     * Additional rules:
     * - a globstar capture matches 0..M characters, each of which which may be anything
     * - a wildcard capture matches 0..M characters, each of which which may be anything except '/'
     * - captures may not be directly adjacent to one another in a pattern
     * - path separators may not be directly adjacent to one another in a pattern
     * - the single character '∅' is a valid pattern representing the set containing no pathnames
     * - the single character '…' is a valid pattern representing the set containing all pathnames
     */
    constructor(pattern) {
        let ast = parsePattern(pattern);
        this.canonical = ast.canonical;
        this.captureNames = ast.captureNames;
    }
    /**
     * Returns a new RoutePattern instance that matches all the pathnames that are
     * matched by *both* `this` and `other`. Returns NEVER_MATCH if there are no
     * such pathnames. Throws an error if the intersection cannot be expressed as a
     * single pattern.
     */
    intersectWith(other) {
        let allIntersections = getAllIntersections(this.canonical, other.canonical);
        let distinctIntersections = getDistinctPatterns(allIntersections);
        if (distinctIntersections.length === 0)
            return RoutePattern.NONE;
        if (distinctIntersections.length === 1)
            return new RoutePattern(distinctIntersections[0]);
        throw new Error(`Intersection of ${this} and ${other} cannot be expressed as a single pattern`);
    }
    //TODO: method to match against pathname...
    toString() {
        return this.canonical;
    }
}
/** Sentinel value for a pattern that matches all pathnames. */
RoutePattern.ALL = new RoutePattern('…');
/** Sentinel value for a pattern that matches no pathnames. */
RoutePattern.NONE = new RoutePattern('∅');
/**
 * Verifies that `pattern` has a valid format, and returns metadata about the pattern.
 * Throws an error if `pattern` is invalid.
 */
function parsePattern(pattern) {
    try {
        let ast = parser.parse(pattern);
        return ast;
    }
    catch (ex) {
        let startCol = ex.location.start.column;
        let endCol = ex.location.end.column;
        if (endCol <= startCol)
            endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        let msg = `${ex.message}:\n${pattern}\n${indicator}`;
        throw new Error(msg);
    }
}
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