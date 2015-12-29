'use strict';
debugger;


import assert = require('assert');


//let r = unify('a*m*n*z', 'a*n*p*z');
//console.log(r);


export function unify(a: string, b: string) {

    let aFixtures = `^${a}$`.split('*');
    let bFixtures = `^${b}$`.split('*');

    if (aFixtures.length === 1) {
        throw new Error('Not implemented');
        // b.length === 1 && a === b
        // for i=0..b.len-1:
        //   ix = a.indexOf(b[i], ix)
        //   if ix === -1 return null
    }
    if (bFixtures.length === 1) {
        throw new Error('Not implemented');
        // as above...
    }

    var x = unifyRest(aFixtures, bFixtures, 1, 1);
    if (x === null) return null;

    //assert(x.length >= 2 && x[0].startsWith('^') && x[x.length - 1].endsWith('$'));

    return x.join('*').slice(1, -1);
}



function unifyRest(a: string[], b: string[], u: number, v: number): string[] {

    // Assert preconditions
    assert(u > 0 && u < a.length && v > 0 && v < b.length);

    // Order by longest first
    if (b.length - v > a.length - u) {
        return unifyRest(b, a, v, u);
    }

    // Stopping case
    if (v === b.length - 1) {
        return unifyOne(a, b, u, v, a.length - u);
    }

    // Recursive case
    else {
        for (let n = 1; n <= a.length - u; ++n) {

            let head = unifyOne(a, b, u, v, n);
            if (head === null) continue;

            let tail = unifyRest(a, b, u + n, v + 1);
            if (tail === null) continue;

            let overlap = head.pop();
            assert(overlap === tail[0]);
            return head.concat(tail);
        }

        return null;
    }
}





function unifyOne(a: string[], b: string[], u: number, v: number, n: number): string[] {

    assert(u > 0 && u < a.length && v > 0 && v < b.length);
    assert(n > 0 && n <= a.length - u);

    let la = a[u - 1];
    let lb = b[v - 1];
    let ra = a[u + n - 1];
    let rb = b[v];

    let l = contains(la, lb) ? la : contains(lb, la) ? lb : null;
    if (l === null) return null;

    let r = contains(ra, rb) ? ra : contains(rb, ra) ? rb : null;
    if (r === null) return null;

    let overlap = longestOverlap(l, r); // TODO: BUG if n > 1
    if (overlap.length > 0) return null; // TODO: over-restrictive; relax through more specific checks

    return [l, ...a.slice(u, u + n - 1), r];
}


function contains(a: string, b: string): boolean {
    return a.indexOf(b) !== -1;
}


function longestOverlap(lhs: string, rhs: string): string {
    return `${lhs}/${rhs}`.match(/(.*)\/\1/)[1];
}
