'use strict';
var pattern_1 = require('./pattern');
/**
 * Returns a pattern that matches all the addresses that are matched by *both* input
 * patterns `a` and `b`. Returns the empty pattern '∅' if `a` and `b` are disjoint.
 * Throws an error if the intersection cannot be expressed as a single pattern.
 * The resulting pattern is guaranteed to be normalized.
 * NB: patterns are case-sensitive.
 * @param {Pattern} a - a pattern instance. May or may not be normalized.
 * @param {Pattern} b - a pattern instance. May or may not be normalized.
 * @returns {Pattern} - a normalized pattern representing the set of addresses S,
 *        such that R ∈ S iff R ∈ `a` and R ∈ `b`.
 */
function intersectPatterns(a, b) {
    var allIntersections = getAllIntersections(a.normalized.toString(), b.normalized.toString());
    var distinctIntersections = getDistinctPatterns(allIntersections);
    if (distinctIntersections.length === 0)
        return pattern_1.default.EMPTY;
    if (distinctIntersections.length === 1)
        return new pattern_1.default(distinctIntersections[0]);
    throw new Error("Intersection of " + a + " and " + b + " cannot be expressed as a single pattern");
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = intersectPatterns;
/**
 * Computes all patterns that may be formed by unifying wildcards from
 * one pattern with substitutable substrings of the other pattern such that
 * all characters from both patterns are present and in order in the result.
 * All the patterns computed in this way represent valid intersections of A
 * and B, however some may be duplicates or subsets of others.
 * @param {string} a - source string of a normalized pattern.
 * @param {string} b - source string of a normalized pattern.
 * @returns {string[]} - list of normalized patterns that represent valid
 *        intersections of `a` and `b`. Some may be superfluous.
 */
function getAllIntersections(a, b) {
    // An empty pattern intersects only with another empty pattern or a single wildcard.
    if (a === '' || b === '') {
        var other = a || b;
        return other === '' || other === '*' || other === '…' ? [''] : [];
    }
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {
        // Obtain all splits. When unifying splits against '*', do strength
        // reduction on split prefixes containing '…' (ie replace '…' with '*')
        var splits = getAllPatternSplits(b);
        if (a[0] === '*')
            splits.forEach(function (pair) { return pair[0] = pair[0].replace(/…/g, '*'); });
        // Compute and return intersections for all valid unifications.
        return splits
            .filter(function (pair) { return a[0] === '…' || (pair[0].indexOf('/') === -1 && pair[0].indexOf('…') === -1); })
            .map(function (pair) { return getAllIntersections(a.slice(1), pair[1]).map(function (u) { return pair[0] + u; }); })
            .reduce(function (ar, el) { return (ar.push.apply(ar, el), ar); }, []);
    }
    else if (b[0] === '…' || b[0] === '*') {
        return getAllIntersections(b, a);
    }
    else if (a[0] === b[0]) {
        return getAllIntersections(a.slice(1), b.slice(1)).map(function (u) { return a[0] + u; });
    }
    // The intersection of A and B is empty.
    return [];
}
/**
 * Returns an array of all the [prefix, suffix] pairs into which `pattern` may be split.
 * Splits that occur on a wildcard character have the wildcard on both sides of the split
 * (i.e. as the last character of the prefix and the first character of the suffix).
 * E.g., 'ab…c' splits into: ['','ab…c'], ['a','b…c'], ['ab…','…c'], and ['ab…c',''].
 */
function getAllPatternSplits(pattern) {
    var result = [];
    for (var i = 0; i <= pattern.length; ++i) {
        var pair = [pattern.substring(0, i), pattern.substring(i)];
        if (pattern[i] === '…' || pattern[i] === '*') {
            pair[0] += pattern[i];
            ++i; // skip next iteration
        }
        result.push(pair);
    }
    return result;
}
/**
 * Returns an array containing a subset of the elements in `patterns`, such that no pattern in
 * the returned array is a (proper or improper) subset of any other pattern in the returned array.
 */
function getDistinctPatterns(patterns) {
    // Set up a parallel array to flag which patterns are duplicates.
    // Start by assuming none are.
    var isDuplicate = patterns.map(function (u) { return false; });
    // Compare all patterns pairwise, marking as duplicates all those
    // patterns that are (proper or improper) subsets of another pattern.
    for (var i = 0; i < patterns.length; ++i) {
        if (isDuplicate[i])
            continue;
        var subsetRecogniser = makeSubsetRecogniser(patterns[i]);
        for (var j = 0; j < patterns.length; ++j) {
            if (i === j || isDuplicate[j])
                continue;
            isDuplicate[j] = subsetRecogniser.test(patterns[j]);
        }
    }
    // Return only the non-duplicate patterns from the original list.
    return patterns.filter(function (_, i) { return !isDuplicate[i]; });
}
/**
 * Returns a regular expression that matches all pattern strings
 * that are (proper or improper) subsets of `pattern`.
 */
function makeSubsetRecogniser(pattern) {
    var re = pattern.split('').map(function (c) {
        if (c === '*')
            return '[^\\/…]*';
        if (c === '…')
            return '.*';
        if (['/._-'].indexOf(c) !== -1)
            return "\\" + c;
        return c;
    }).join('');
    return new RegExp("^" + re + "$");
}
//# sourceMappingURL=intersect-patterns.js.map