'use strict';
debugger;
var assert = require('assert');
var r = unify('a*m*n*z', 'a*n*p*z');
console.log(r);
function unify(a, b) {
    var aFixtures = ("^" + a + "$").split('*');
    var bFixtures = ("^" + b + "$").split('*');
    if (aFixtures.length === 1) {
        throw new Error('Not implemented');
    }
    if (bFixtures.length === 1) {
        throw new Error('Not implemented');
    }
    var x = unifyRest(aFixtures, bFixtures, 1, 1);
    if (x === null)
        return null;
    //assert(x.length >= 2 && x[0].startsWith('^') && x[x.length - 1].endsWith('$'));
    return x.join('*').slice(1, -1);
}
exports.unify = unify;
function unifyRest(a, b, u, v) {
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
    else {
        for (var n = 1; n <= a.length - u; ++n) {
            var head = unifyOne(a.slice(u - 1, u + n), b.slice(v - 1, v + 1));
            if (head === null)
                continue;
            var tail = unifyRest(a, b, u + n, v + 1);
            if (tail === null)
                continue;
            var overlap = head.pop();
            assert(overlap === tail[0]);
            return head.concat(tail);
        }
        return null;
    }
}
function unifyOne(a, b) {
    assert(a.length >= 2 && b.length === 2);
    // assert(u > 0 && u < a.length && v > 0 && v < b.length);
    // assert(n > 0 && n <= a.length - u);
    var la = a[0], lb = b[0];
    var ra = a[a.length - 1], rb = b[1];
    // let la = a[u - 1];
    // let lb = b[v - 1];
    // let ra = a[u + n - 1];
    // let rb = b[v];
    var l = contains(la, lb) ? la : contains(lb, la) ? lb : null;
    if (l === null)
        return null;
    var r = contains(ra, rb) ? ra : contains(rb, ra) ? rb : null;
    if (r === null)
        return null;
    var overlap = longestOverlap(l, r); // TODO: BUG if n > 1
    if (overlap.length > 0)
        return null; // TODO: over-restrictive; relax through more specific checks
    return [l].concat(a.slice(1, -1), [r]);
}
function contains(a, b) {
    return a.indexOf(b) !== -1;
}
function longestOverlap(lhs, rhs) {
    return (lhs + "/" + rhs).match(/(.*)\/\1/)[1];
}
//# sourceMappingURL=route-pattern-3.js.map