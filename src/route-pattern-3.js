'use strict';
//debugger;
var assert = require('assert');
class Segment {
    constructor(text) {
        // TODO: Validate...
        this.terms = `^${text}$`.split('*');
    }
}
exports.Segment = Segment;
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
function intersectSegments(a, b) {
    if (a.terms.length === 1) {
        throw new Error('Not implemented');
    }
    if (b.terms.length === 1) {
        throw new Error('Not implemented');
    }
    var x = unifyRest(a.terms, b.terms);
    if (x === null)
        return null;
    //assert(x.length >= 2 && x[0].startsWith('^') && x[x.length - 1].endsWith('$'));
    return x.join('*').slice(1, -1);
}
exports.intersectSegments = intersectSegments;
function unifyRest(a, b) {
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
    else {
        for (let n = 2; n <= a.length; ++n) {
            let head = unifyOne(a.slice(0, n), b.slice(0, 2));
            if (head === null)
                continue;
            let tail = unifyRest(a.slice(n - 1), b.slice(1));
            if (tail === null)
                continue;
            let overlap = head.pop();
            assert(overlap === tail[0]);
            return head.concat(tail);
        }
        return null;
    }
}
function unifyOne(a, b) {
    assert(a.length >= 2 && b.length === 2);
    let la = a[0], lb = b[0];
    let ra = a[a.length - 1], rb = b[1];
    let l = contains(la, lb) ? la : contains(lb, la) ? lb : null;
    if (l === null)
        return null;
    let r = contains(ra, rb) ? ra : contains(rb, ra) ? rb : null;
    if (r === null)
        return null;
    let overlap = longestOverlap(l, r); // TODO: BUG if n > 1
    if (overlap.length > 0)
        return null; // TODO: over-restrictive; relax through more specific checks
    return [l, ...a.slice(1, -1), r];
}
function contains(a, b) {
    return a.indexOf(b) !== -1;
}
function longestOverlap(lhs, rhs) {
    return `${lhs}/${rhs}`.match(/(.*)\/\1/)[1];
}
function toRegExp(t) {
}
//# sourceMappingURL=route-pattern-3.js.map