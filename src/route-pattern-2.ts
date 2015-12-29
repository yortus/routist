'use strict';
export = RoutePattern;


// TODO: validation:
// - valid tokens: /, a-z, A-Z, 0-9, _, ., -, *, ** (plus named captures eg {$name})
// - all segments start with '/'
// - '**' must be an entire segment, ie '.../**/...'
// - '*' may not be followed by another '*' (except as a globstar operator) (eg '/*{name}')
// - ditto for '**' (eg '/**/**')

//   ADDED 27/12/2015:
// - maximum two '*' per segment (supports "starts with", "ends with", and "contains")
// - maximum two '**' per pattern (analogous logic as above)

class RoutePattern {
    constructor(public source: string) {
        this.canonical = source
            .replace(/\/\*\*/g, '…')
            .replace(/\/\{\.\.\.[a-zA-Z0-9_$]+\}/g, '…')
            .replace(/\{[a-zA-Z0-9_$]+\}/g, '*');
    }

    /** Sentinel value for a pattern that matches all URLs. */
    static EVERYTHING = <RoutePattern> { canonical: '…', toString: () => '…' }; // U+2026 HORIZONTAL ELLIPSIS

    /** Sentinel value for a pattern that matches no URLs. */
    static NOTHING = <RoutePattern> { canonical: '∅', toString: () => '∅' }; // U+2205 EMPTY SET

    // TODO: doc...
    intersectWith(other: RoutePattern) {
        return new RoutePattern(intersect(this.canonical, other.canonical));
    }

    canonical: string;

    matcher: RegExp;
}





function intersectSegment(a: string, b: string): string {

    let aInfo = analyzeSegment(a);
    let bInfo = analyzeSegment(b);

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


function analyzeSegment(s: string): SegmentInfo {

    if (s === '*') {
        return { isAnything: true };
    }

    if (s.indexOf('*') === -1) {
        return { isExactly: s };
    }

    let result = <SegmentInfo> {};
    var subsegments = s.split('*');
    if (subsegments.length > 3) {
        throw new Error(`RoutePattern: segment too complex: '${s}'`);
    }

    result.startsWith = subsegments[0] || null;
    result.endsWith = subsegments[subsegments.length - 1] || null;
    result.contains = subsegments.length === 3 ? subsegments[1] : null;
    return result;
}


interface SegmentInfo {
    isAnything?: boolean;
    isExactly?: string;
    startsWith?: string;
    endsWith?: string;
    contains?: string;
}































/** TODO: doc... NB a and b are both assumed to be canonical forms of valid patterns */
function intersect(a: string, b: string): string {

    // Declare short local aliases for the identity patterns in their canonical form.
    const NOTHING = RoutePattern.NOTHING.canonical;
    const EVERYTHING = RoutePattern.EVERYTHING.canonical;

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
        let a_rest = a.substr(1);
        let i = b.indexOf('/', b[0] === '…' ? 0 : 1);
        let b_rest = i === -1 ? '' : b.substr(i);
        let b_first = b.substr(0, b.length - b_rest.length)

        // Search for a non-empty intersection of A/Arest against B/Brest. This is
        // a recursive search that is guaranteed to halt. It corresponds to trying
        // to unify A's globstar with 0..M complete segments of B.
        let rest = intersect(a_rest, b);
        if (rest !== NOTHING) {
            return b[0] === '…' ? concat('…', rest) : rest;
        }
        rest = intersect(a_rest, b_rest);
        if (rest === NOTHING) rest = intersect(a, b_rest);
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
        let a_rest = a.substr(1);
        let b_rest = b.substr(1);
        let rest = NOTHING;
        if (rest === NOTHING) rest = intersect(a_rest, b_rest);
        if (rest === NOTHING) rest = intersect(a, b_rest);
        if (rest === NOTHING && b[0] === '*') rest = intersect(a_rest, b);
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
function concat(a: string, b: string): string {
    const NOTHING = RoutePattern.NOTHING.canonical;
    return a === NOTHING || b === NOTHING ? NOTHING : (a + b);
}
