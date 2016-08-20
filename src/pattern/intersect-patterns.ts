




/**
 * TODO: revise... too complex to understand the first sentence...
 * Returns the minimal list of disjoint normalized patterns whose union matches all the addresses
 * that are matched by *both* of the input patterns `a` and `b`.


 * Returns a pattern that matches all the addresses that are matched by *both* input
 * patterns `a` and `b`. Returns the empty pattern '∅' if `a` and `b` are disjoint.
 * Throws an error if the intersection cannot be expressed as a single pattern.
 * The resulting pattern is guaranteed to be normalized.
 * NB: patterns are case-sensitive.
 * @param {string} a - a normalized pattern source.
 * @param {string} b - a normalized pattern source.
 * @returns {string[]} - an array of normalized pattern sources representing the set of addresses S,
 *        such that for all R, R ∈ S iff R ∈ `a` and R ∈ `b`.
 */
export default function intersectPatterns(a: string, b: string): string[] {

    // TODO: temp testing...
    let allIntersections = getAllIntersections(a, b);
    let distinctIntersections = getDistinctPatterns(allIntersections);
    return distinctIntersections;

    // TODO: was...
    // if (distinctIntersections.length === 0) return Pattern.EMPTY;
    // if (distinctIntersections.length === 1) return new Pattern(distinctIntersections[0]);
    // let cands = distinctIntersections.join(', ');
    // throw new Error(`Intersection of ${a} and ${b} cannot be expressed as a single pattern. Candidates are: ${cands}`);
}





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
            .filter(pair => a[0] === '…' || (pair[0].indexOf('/') === -1 && pair[0].indexOf('…') === -1))
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

    // A and B are disjoint.
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
 * Returns an array containing a subset of the elements in `patterns`, such that no pattern in
 * the returned array is a (proper or improper) subset of any other pattern in the returned array.
 */
function getDistinctPatterns(patterns: string[]) {

    // Set up a parallel array to flag which patterns are duplicates.
    // Start by assuming none are.
    let isDuplicate = patterns.map(u => false);

    // Compare all patterns pairwise, marking as duplicates all those
    // patterns that are (proper or improper) subsets of another pattern.
    for (let i = 0; i < patterns.length; ++i) {
        if (isDuplicate[i]) continue;
        let subsetRecogniser = makeSubsetRecogniser(patterns[i]);
        for (let j = 0; j < patterns.length; ++j) {
            if (i === j || isDuplicate[j]) continue;
            isDuplicate[j] = subsetRecogniser.test(patterns[j]);
        }
    }

    // Return only the non-duplicate patterns from the original list.
    return patterns.filter((_, i) => !isDuplicate[i]);
}





/**
 * Returns a regular expression that matches all pattern strings
 * that are (proper or improper) subsets of `pattern`.
 */
function makeSubsetRecogniser(pattern: string) {
    let re = pattern.split('').map(c => {
        if (c === '*') return '[^\\/…]*';
        if (c === '…') return '.*';
        if (' /._-'.indexOf(c) !== -1) return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
