'use strict';
debugger;
var assert = require('assert');
//let r = unify('a*m*n*z', 'a*n*p*z');
//console.log(r);
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
        return unifyOne(a, b, u, v, a.length - u);
    }
    else {
        for (var n = 1; n <= a.length - u; ++n) {
            var head = unifyOne(a, b, u, v, n);
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
function unifyOne(a, b, u, v, n) {
    assert(u > 0 && u < a.length && v > 0 && v < b.length);
    assert(n > 0 && n <= a.length - u);
    var la = a[u - 1];
    var lb = b[v - 1];
    var ra = a[u + n - 1];
    var rb = b[v];
    var l = contains(la, lb) ? la : contains(lb, la) ? lb : null;
    if (l === null)
        return null;
    var r = contains(ra, rb) ? ra : contains(rb, ra) ? rb : null;
    if (r === null)
        return null;
    var overlap = longestOverlap(l, r); // TODO: BUG if n > 1
    if (overlap.length > 0)
        return null; // TODO: over-restrictive; relax through more specific checks
    return [l].concat(a.slice(u, u + n - 1), [r]);
}
function contains(a, b) {
    return a.indexOf(b) !== -1;
}
function longestOverlap(lhs, rhs) {
    return (lhs + "/" + rhs).match(/(.*)\/\1/)[1];
}
//# sourceMappingURL=route-pattern-3.js.map