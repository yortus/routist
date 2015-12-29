'use strict';
debugger;


import assert = require('assert');


let r = unify('a*m*n*z', 'a*n*p*z');
console.log(r);


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
        return unifyOne(a.slice(u - 1), b.slice(v - 1));
    }

    // Recursive case
    else {
        for (let n = 1; n <= a.length - u; ++n) {

            let head = unifyOne(a.slice(u - 1, u + n), b.slice(v - 1, v + 1));
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





function unifyOne(a: string[], b: string[]): string[] {

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
