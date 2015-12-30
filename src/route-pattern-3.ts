'use strict';
//debugger;


import assert = require('assert');


type PatternAST = Array<SegmentAST[] | { '**': string }>;


type SegmentAST = Array<string | { '*': string }>;


export class Segment {
    constructor(text: string) {
        // TODO: Validate...
        this.terms = `^${text}$`.split('*');
    }

    terms: TermList;
}


interface TermList extends Array<string> { }


// TODO: BUG: *m*n*   ∩   *n*m*   ==>   *m*n*m* (WRONG!)
let r = intersectSegments(new Segment('*m*n*'), new Segment('*n*m*'));
console.log(r);


// TODO: validation:
// - valid tokens: /, a-z, A-Z, 0-9, _, ., -, *, ** (plus named captures eg {$name})
// - all segments start with '/'
// - '**' must be an entire segment, ie '.../**/...'
// - '*' may not be followed by another '*' (except as a globstar operator) (eg '/*{name}')
// - ditto for '**' (eg '/**/**')

//   ADDED 27/12/2015:
// - maximum two '*' per segment (supports "starts with", "ends with", and "contains")
// - maximum two '**' per pattern (analogous logic as above)




export function intersectSegments(a: Segment, b: Segment) {


    if (a.terms.length === 1) {
        throw new Error('Not implemented');
        // b.length === 1 && a === b
        // for i=0..b.len-1:
        //   ix = a.indexOf(b[i], ix)
        //   if ix === -1 return null
    }
    if (b.terms.length === 1) {
        throw new Error('Not implemented');
        // as above...
    }

    var x = unifyRest(a.terms, b.terms);
    if (x === null) return null;

    //assert(x.length >= 2 && x[0].startsWith('^') && x[x.length - 1].endsWith('$'));

    return x.join('*').slice(1, -1);
}



function unifyRest(a: TermList, b: TermList): string[] {

    // Assert preconditions
    assert(a.length >= 2 && b.length >= 2);

    // Order by longest first
    if (b.length > a.length) {
        return unifyRest(b, a);
    }

    // Stopping case
    if (b.length === 2) {
        return unifyOne(a, b);
    }

    // Recursive case
    else {
        for (let n = 2; n <= a.length; ++n) {

            let head = unifyOne(a.slice(0, n), b.slice(0, 2));
            if (head === null) continue;

            let tail = unifyRest(a.slice(n - 1), b.slice(1));
            if (tail === null) continue;

            let overlap = head.pop();
            assert(overlap === tail[0]);
            return head.concat(tail);
        }

        return null;
    }
}





function unifyOne(a: TermList, b: TermList): string[] {

    assert(a.length >= 2 && b.length === 2);

    let la = a[0], lb = b[0];
    let ra = a[a.length - 1], rb = b[1];        

    let l = contains(la, lb) ? la : contains(lb, la) ? lb : null;
    if (l === null) return null;

    let r = contains(ra, rb) ? ra : contains(rb, ra) ? rb : null;
    if (r === null) return null;

    let overlap = longestOverlap(l, r); // TODO: BUG if n > 1
    if (overlap.length > 0) return null; // TODO: over-restrictive; relax through more specific checks

    return [l, ...a.slice(1, -1), r];
}


function contains(a: string, b: string): boolean {
    return a.indexOf(b) !== -1;
}


function longestOverlap(lhs: string, rhs: string): string {
    return `${lhs}/${rhs}`.match(/(.*)\/\1/)[1];
}


function toRegExp(t: TermList) {
}
