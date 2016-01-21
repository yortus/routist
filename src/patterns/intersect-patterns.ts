'use strict';
import parsePatternSource from './parse-pattern-source';
import Pattern from './pattern';





/**
 * Generates a pattern that matches all the pathnames that are matched by *both*
 * patterns `a` and `b`. Returns the empty pattern '∅' if `a` and `b` are disjoint.
 * Throws an error if the intersection cannot be expressed as a single pattern.
 * Note that patterns are case-sensitive.
 * @param {Pattern|string} a - a pattern. It may be provided either as a Pattern
 *        instance, or as a pattern string.
 * @param {Pattern|string} b - a pattern. It may be provided either as a Pattern
 *        instance, or as a pattern string.
 * @returns {Pattern} - the pattern that matches all pathnames matched by both `a` and `b`.
 */
export default function intersectPatterns(a: Pattern|string, b: Pattern|string): Pattern {
    let p = typeof a === 'string' ? parsePatternSource(a).signature : a.signature;
    let q = typeof b === 'string' ? parsePatternSource(b).signature : b.signature;
    let allIntersections = getAllIntersections(p, q);
    let distinctIntersections = getDistinctPatterns(allIntersections);
    if (distinctIntersections.length === 0) return Pattern.EMPTY;
    if (distinctIntersections.length === 1) return new Pattern(distinctIntersections[0]);
    throw new Error(`Intersection of ${a} and ${b} cannot be expressed as a single pattern`);
}





/**
 * Computes all patterns that may be formed by unifying wildcards from
 * one pattern with substitutable substrings of the other pattern such that
 * all characters from both patterns are present and in order in the result.
 * All the patterns computed in this way represent valid intersections of A
 * and B, however some may be duplicates or subsets of others.
 */
function getAllIntersections(a: string, b: string): string[] {

    // An empty pattern intersects only with another empty pattern or a single wildcard.
    if (a === '' || b === '') {
        let other = a || b;
        return other === '' || other === '*' || other === '…' ? [''] : [];
    }

    // A starts with a wildcard. Generate all possible intersections by unifying
    // the wildcard with all substitutable prefixes of B, and intersecting the remainders.
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {

        // Obtain all splits. When unifying splits against '*', do strength
        // reduction on split prefixes containing '…' (ie replace '…' with '*')
        let splits = getAllPatternSplits(b);
        if (a[0] === '*') splits.forEach(pair => pair[0] = pair[0].replace(/…/g, '*'));

        // Compute and return intersections for all valid unifications.
        return splits
            .filter(pair => a[0] === '…' || (!pair[0].includes('/') && !pair[0].includes('…')))
            .map(pair => getAllIntersections(a.slice(1), pair[1]).map(u => pair[0] + u))
            .reduce((ar, el) => (ar.push.apply(ar, el), ar), []);
    }

    // B starts with a wildcard. Delegate to previous case (intersection is commutative).
    else if (b[0] === '…' || b[0] === '*') {
         return getAllIntersections(b, a);
    }

    // Both patterns start with the same literal. Intersect their remainders recursively.
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
 * E.g., 'ab…c' splits into: ['','ab…c'], ['a','b…c'], ['ab…','…c'], and ['ab…c',''].
 */
function getAllPatternSplits(pattern: string): [string, string][] {
    let result = [];
    for (let i = 0; i <= pattern.length; ++i) {
        let pair = [pattern.substring(0, i), pattern.substring(i)];
        if (pattern[i] === '…' || pattern[i] === '*') {
            pair[0] += pattern[i];
            ++i; // skip next iteration
        }
        result.push(pair);
    }
    return result;
}





/**
 * Returns a subset of the given list of patterns, such that no pattern in the
 * resulting list is a (proper or improper) subset of any other pattern in the list.
 */
function getDistinctPatterns(patterns: string[]) {

    // Set up a parallel array to flag which patterns are distinct. Start by assuming they all are.
    let isDistinct = patterns.map(u => true);

    // Compare all patterns pairwise, discarding those that are (proper or improper) subsets of another.
    for (let i = 0; i < patterns.length; ++i) {
        if (!isDistinct[i]) continue;
        let subsetRecogniser = makeSubsetRecogniser(patterns[i]);
        for (let j = 0; j < patterns.length; ++j) {
            if (i === j || !isDistinct[j]) continue;
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
function makeSubsetRecogniser(pattern: string) {
    let re = pattern.split('').map(c => {
        if (c === '*') return '[^\\/…]*';
        if (c === '…') return '.*';
        if (['/._-'].indexOf(c) !== -1) return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}