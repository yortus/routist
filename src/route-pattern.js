// TODO: add missing features:
// 1. [ ] support segments AFTER the rest/globstar (in addition to segments BEFORE it)
// 2. [ ] remove distinct handling of extensions
// 3. [ ] support segments with BOTH literal AND capture parts, not just either-or (and pre- and post- literal parts). This also adds back extension support.
var dsl = require('./route-pattern-dsl');
/**
 * A route pattern represents a set of URLs by describing the constraints
 * that any given URL must satisfy in order to match the pattern.
 */
class RoutePattern {
    /** Construct a new RoutePattern instance. */
    constructor(source) {
        var parts = dsl.parse(source);
        this.method = parts.method ? parts.method.toUpperCase() : null;
        this.segments = parts.segments;
        this.rest = parts.rest;
        this.canonical = getCanonicalForm(parts);
        ensureNoDuplicateCaptureNames(this);
    }
    /**
     * A pattern may be thought of as shorthand for describing the set of URL paths
     * that match the pattern. The intersection of two patterns is thus the set of
     * URL paths that match both patterns. This function returns a pattern describing
     * this intersection set for any two given patterns.
     */
    intersectWith(other) {
        return computeIntersection(this, other);
    }
    /**
     * Attempts to match the given request specifics against the pattern. If the
     * match is successful, returns a hash containing the name/value pairs for each
     * named capture in the pattern. If the match fails, returns null. The operation
     * is case-sensitive.
     */
    match(method, pathname) {
        return matchRequestAgainstPattern(this, method, pathname);
    }
    /** The string representation of a pattern is its canonical form. */
    toString() {
        return this.canonical;
    }
}
/** Sentinel value for a pattern that matches all URLs. */
RoutePattern.UNIVERSAL = { canonical: 'U', toString: () => 'U' };
/** Sentinel value for a pattern that matches no URLs. */
RoutePattern.EMPTY = { canonical: 'E', toString: () => 'E' };
/**
 * Return the canonical textual representation of the pattern.
 * Equivalent patterns are guaranteed to return the same result.
 */
function getCanonicalForm(parts) {
    // Put all the pattern parts together canonically.
    var cf = (parts.method || 'ANY') + ' ';
    for (var i = 0; i < parts.segments.length; ++i) {
        if (parts.rest && i === parts.rest.index)
            cf += '/**';
        var s = parts.segments[i];
        cf += '/' + (s.type === 'literal' ? s.text : '*');
    }
    if (parts.rest && parts.rest.index === parts.segments.length)
        cf += '/**';
    return cf;
}
/** Private helper function for RoutePattern constructor. */
function ensureNoDuplicateCaptureNames(pattern) {
    var names = pattern.segments.filter(s => s.type === 'capture').map(s => s.name);
    if (pattern.rest && pattern.rest.name)
        names.push(pattern.rest.name);
    for (var i = 0; i < names.length; ++i) {
        if (names.indexOf(names[i], i + 1) === -1)
            continue;
        throw new Error("Duplicate capture name '" + names[i] + "' in route pattern '" + pattern.toString() + "'");
    }
}
/** Private helper function for RoutePattern#intersectWith. */
function computeIntersection(a, b) {
    // Handle identity cases.
    if (a === RoutePattern.UNIVERSAL || b === RoutePattern.EMPTY)
        return b;
    if (b === RoutePattern.UNIVERSAL || a === RoutePattern.EMPTY)
        return a;
    // Compute the intersection of the methods.
    if (a.method && b.method && a.method !== b.method)
        return RoutePattern.EMPTY;
    var method = a.method || b.method;
    // Compute the intersection of the formal segments. If one pattern has more formal segments
    // than the other, the excess formal segments are considered in a subsequent step.
    var longestCommonCount = Math.min(a.segments.length, b.segments.length);
    var segments = [];
    for (var i = 0; i < longestCommonCount; ++i) {
        var segmentA = a.segments[i];
        var segmentB = b.segments[i];
        if (segmentA.type === 'literal' && segmentB.type === 'literal' && segmentA.text !== segmentB.text)
            return RoutePattern.EMPTY;
        var segment = segmentA.type === 'literal' ? segmentA : segmentB;
        segments.push(segment);
    }
    // Compute the intersection of the excess formal segments excluded from the previous step.
    if (Math.max(a.segments.length, b.segments.length) > longestCommonCount) {
        if (a.segments.length > longestCommonCount) {
            if (!b.rest)
                return RoutePattern.EMPTY;
            segments = segments.concat(a.segments.slice(longestCommonCount));
        }
        else {
            if (!a.rest)
                return RoutePattern.EMPTY;
            segments = segments.concat(b.segments.slice(longestCommonCount));
        }
    }
    // Compute the intersection of the 'rest' segment(s).
    var rest = a.rest && b.rest ? { index: 0, name: null } : null;
    // Return the result.
    return new RoutePattern(getCanonicalForm({ method, segments, rest }));
}
/** Private helper function for RoutePattern#match. */
function matchRequestAgainstPattern(pattern, method, pathname) {
    var result = {};
    // Match the method.
    if (pattern.method && pattern.method !== method.toUpperCase())
        return null;
    // Match the formal segments.
    var pathSegments = pathname.slice(1).split('/').map(decodeURIComponent);
    if (pathSegments.length < pattern.segments.length)
        return null;
    if (pathSegments.length > pattern.segments.length && !pattern.rest)
        return null;
    for (var i = 0; i < pattern.segments.length; ++i) {
        var patternSegment = pattern.segments[i];
        var pathSegment = pathSegments[i];
        if (patternSegment.type === 'literal') {
            if (patternSegment.text !== pathSegments[i])
                return null;
        }
        else {
            if (patternSegment.name)
                result[patternSegment.name] = pathSegments[i];
        }
    }
    // Match the pattern's 'rest' segment(s).
    if (pattern.rest && pattern.rest.name) {
        var rest = pathSegments.slice(pattern.segments.length).join('/');
        result[pattern.rest.name] = rest;
    }
    // All done.
    return result;
}
module.exports = RoutePattern;
//# sourceMappingURL=route-pattern.js.map