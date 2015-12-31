'use strict';
describe('it', () => {
    // it('works', done => {
    //     routist.main().then(result => {
    //         console.log(result);
    //         done()
    //     });        
    // });
    it('works', () => {
        var tests = [
            '/ab* ∩ /*b',
            '/f*o*o*z ∩ /foo*baz',
            '/*/f*o*o*baz ∩ /aaa/foo*z',
            '/ab*b ∩ /a*bc',
            '/ab*b ∩ /a*bc*',
            '/a*b ∩ /ab*ab',
            '/a*b ∩ /ba*ab',
            '/*m*n* ∩ /*n*m*',
            '/*m*n* ∩ /*n*m*n*',
            '/ ∩ /',
            '/ ∩ /*',
            '/* ∩ /*',
            '/* ∩ /',
            '/f ∩ /',
            '/ ∩ /f',
            '/a/b ∩ /*',
            '/a/b ∩ /*/*c*',
            '/a/*b ∩ /*/*c*',
            '/a/*b ∩ /*/*c*/*',
            '/foo/* ∩ /*/bar',
            '/a/b ∩ /…',
            '/a/b ∩ …',
            '/ ∩ …',
            ' ∩ …',
            '….html ∩ …',
            '/foo/….html ∩ …',
            '/foo/….html ∩ /foo/bar/*z/*',
            '/foo/….html ∩ /foo/bar/*z/…',
            '/* ∩ /…',
            '/*/* ∩ /…',
            '/… ∩ /…',
            '/… ∩ /*/*',
            '/…/* ∩ /…',
            '/*/… ∩ /…',
            '/… ∩ /…/*',
            '/… ∩ /*/…',
            '/*/…/* ∩ /…',
            '*/… ∩ …/*',
            '*… ∩ …*',
            'a… ∩ …a',
            '*a… ∩ …a*',
            '…a* ∩ *a…',
            '…a* ∩ *z…',
            '*z… ∩ …a*',
            '*z* ∩ *a*',
            'a*… ∩ …*a',
            'a…* ∩ *…a',
            'a* ∩ *a',
            'a/… ∩ …/a',
        ];
        tests.forEach(test => {
            let pair = test.split(' ∩ '), a = pair[0], b = pair[1];
            let all = getAllIntersections(a, b);
            let distinct = getDistinctPatterns(all);
            let result = distinct.length === 0 ? '∅' : distinct.join(' ∪ ');
            if (a.indexOf('*…') !== -1 || a.indexOf('…*') !== -1 || b.indexOf('*…') !== -1 || b.indexOf('…*') !== -1)
                distinct = 'INVALID';
            console.log(`${test}   ==>   ${distinct}`);
        });
    });
});
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
        if (['/'].indexOf(c) !== -1)
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
//# sourceMappingURL=main.js.map