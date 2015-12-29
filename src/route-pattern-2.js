'use strict';
// TODO: validation:
// - valid tokens: /, a-z, A-Z, 0-9, _, ., -, *, ** (plus named captures eg {$name})
// - all segments start with '/'
// - '**' must be an entire segment, ie '.../**/...'
// - '*' may not be followed by another '*' (except as a globstar operator) (eg '/*{name}')
// - ditto for '**' (eg '/**/**')
//   ADDED 27/12/2015:
// - maximum two '*' per segment (supports "starts with", "ends with", and "contains")
// - maximum two '**' per pattern (analogous logic as above)
var RoutePattern = (function () {
    function RoutePattern(source) {
        this.source = source;
        this.canonical = source
            .replace(/\/\*\*/g, '…')
            .replace(/\/\{\.\.\.[a-zA-Z0-9_$]+\}/g, '…')
            .replace(/\{[a-zA-Z0-9_$]+\}/g, '*');
    }
    // TODO: doc...
    RoutePattern.prototype.intersectWith = function (other) {
        return new RoutePattern(intersect(this.canonical, other.canonical));
    };
    /** Sentinel value for a pattern that matches all URLs. */
    RoutePattern.EVERYTHING = { canonical: '…', toString: function () { return '…'; } }; // U+2026 HORIZONTAL ELLIPSIS
    /** Sentinel value for a pattern that matches no URLs. */
    RoutePattern.NOTHING = { canonical: '∅', toString: function () { return '∅'; } }; // U+2205 EMPTY SET
    return RoutePattern;
})();
function intersectSegment(a, b) {
    var aInfo = analyzeSegment(a);
    var bInfo = analyzeSegment(b);
    // isAnything
    if (aInfo.isAnything) {
        return b;
    }
    if (bInfo.isAnything) {
        return a;
    }
    if (aInfo.isExactly) {
    }
    if (aInfo.startsWith) {
    }
    if (aInfo.endsWith) {
    }
    if (aInfo.contains) {
    }
}
function analyzeSegment(s) {
    if (s === '*') {
        return { isAnything: true };
    }
    if (s.indexOf('*') === -1) {
        return { isExactly: s };
    }
    var result = {};
    var subsegments = s.split('*');
    if (subsegments.length > 3) {
        throw new Error("RoutePattern: segment too complex: '" + s + "'");
    }
    result.startsWith = subsegments[0] || null;
    result.endsWith = subsegments[subsegments.length - 1] || null;
    result.contains = subsegments.length === 3 ? subsegments[1] : null;
    return result;
}
/** TODO: doc... NB a and b are both assumed to be canonical forms of valid patterns */
function intersect(a, b) {
    // Declare short local aliases for the identity patterns in their canonical form.
    var NOTHING = RoutePattern.NOTHING.canonical;
    var EVERYTHING = RoutePattern.EVERYTHING.canonical;
    // If either pattern matches no strings, then their intersection matches no strings.
    if (a === NOTHING || b === NOTHING) {
        return NOTHING;
    }
    // If either pattern matches only the empty string, then their intersection matches:
    // - only the empty string if the other pattern matches the empty string;
    // - no strings if the other pattern does not match the empty string.
    if (a === '' || b === '') {
        return a + b === '' || a + b === '*' ? '' : NOTHING;
    }
    // If pattern A starts with a glob star, then A ∩ B is computed as follows.
    if (a[0] === '…') {
        // If pattern B does not start with a complete segment, A ∩ B matches no strings.
        if (b[0] !== '/' && b[0] !== '…') {
            return NOTHING;
        }
        // Compute the patterns formed by removing the first segment of A and of B.
        var a_rest = a.substr(1);
        var i = b.indexOf('/', b[0] === '…' ? 0 : 1);
        var b_rest = i === -1 ? '' : b.substr(i);
        var b_first = b.substr(0, b.length - b_rest.length);
        // Search for a non-empty intersection of A/Arest against B/Brest. This is
        // a recursive search that is guaranteed to halt. It corresponds to trying
        // to unify A's globstar with 0..M complete segments of B.
        var rest = intersect(a_rest, b);
        if (rest !== NOTHING) {
            return b[0] === '…' ? concat('…', rest) : rest;
        }
        rest = intersect(a_rest, b_rest);
        if (rest === NOTHING)
            rest = intersect(a, b_rest);
        return concat(b_first, rest);
    }
    // If pattern B starts with a glob star, reuse the above clause given that A ∩ B ≡ B ∩ A.
    if (b[0] === '…') {
        return intersect(b, a);
    }
    // If pattern A starts with a '*', then A ∩ B is computed using a recursive search.
    // The search is similar to the globstar case above, except it progresses in single
    // characters rather than whole segments, and is bounded within B's first segment.
    if (a[0] === '*') {
        if (b[0] === '/') {
            return intersect(a.substr(1), b);
        }
        var a_rest = a.substr(1);
        var b_rest = b.substr(1);
        var rest = NOTHING;
        if (rest === NOTHING)
            rest = intersect(a_rest, b_rest);
        if (rest === NOTHING)
            rest = intersect(a, b_rest);
        if (rest === NOTHING && b[0] === '*')
            rest = intersect(a_rest, b);
        return concat(b[0], rest);
    }
    // If pattern B starts with a '*', reuse the above clause given that A ∩ B ≡ B ∩ A.
    if (b[0] === '*') {
        return intersect(b, a);
    }
    // For all other cases, consider the first character of each pattern:
    // - if they are the same, the intersection is computed recursively from their remaining characters;
    // - if they are not the same, their intersection macthes no strings.
    return a[0] === b[0] ? concat(a[0], intersect(a.substr(1), b.substr(1))) : NOTHING;
}
// TODO: doc...
function concat(a, b) {
    var NOTHING = RoutePattern.NOTHING.canonical;
    return a === NOTHING || b === NOTHING ? NOTHING : (a + b);
}
module.exports = RoutePattern;
//# sourceMappingURL=route-pattern-2.js.map