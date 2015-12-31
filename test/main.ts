'use strict';


//import routist = require('..');
import {expect} from 'chai';


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
            '*… ∩ …*', // TODO: <==== BUG result is '*…'. Should disallow adjacent * and …
            'a… ∩ …a',
            '*a… ∩ …a*', // TODO: <==== BUG result is *a* ∪ *a*a… ∪ *a…a* (how got *a*a… ??)
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
            let distinct = getDistinctIntersections(all);
            let result = distinct.length === 0 ? '∅' : distinct.join(' ∪ ');
            if (a.indexOf('*…') !== -1 || a.indexOf('…*') !== -1 || b.indexOf('*…') !== -1 || b.indexOf('…*') !== -1) distinct = 'INVALID';
            console.log(`${test}   ==>   ${distinct}`);
        });
    });
});


function getDistinctIntersections(allIntersections: string[]) {

    // Set up a parallel array to flag which patterns are distinct. Start by assuming they all are.
    let isDistinct = allIntersections.map(u => true);

    // Compare all patterns pairwise, discarding those that are (proper or improper) subsets of another.
    for (let i = 0; i < allIntersections.length; ++i) {
        if (!isDistinct[i]) continue;
        let subsetRecogniser = makeSubsetRecogniser(allIntersections[i]);
        for (let j = 0; j < allIntersections.length; ++j) {
            if (i === j || !isDistinct[j]) continue;
            isDistinct[j] = !subsetRecogniser.test(allIntersections[j]);
        }
    }

    // Return only the distinct patterns from the original list.
    return allIntersections.filter((_, i) => isDistinct[i]);
}


function makeSubsetRecogniser(pattern: string) {
    let re = pattern.split('').map(c => {
        if (c === '*') return '[^\\/…]*';
        if (c === '…') return '.*';
        if (['/'].indexOf(c) !== -1) return `\\${c}`;
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
function getAllIntersections(a: string, b: string): string[] {

    // An empty pattern intersects only with another empty pattern or a single wildcard.
    if (a === '' || b === '') {
        let other = a || b;
        return other === '' || other === '*' || other === '…' ? [''] : [];
    }

    // A starts with a wildcard. Generate all possible intersections by unifying
    // the wildcard with all substitutable prefixes of B, and intersecting the remainders.
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {
        return getAllPatternSplits(b)
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
 * E.g., 'ab*c' splits into ['', 'ab*c'], ['a', 'b*c'], ['ab*', '*c'], and ['ab*c', ''].
 */
function getAllPatternSplits(pattern: string): [string, string][] {
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
