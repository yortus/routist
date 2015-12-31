

// TODO: add missing features:
// 1. [ ] support segments AFTER the rest/globstar (in addition to segments BEFORE it)
// 2. [ ] remove distinct handling of extensions
// 3. [ ] support segments with BOTH literal AND capture parts, not just either-or (and pre- and post- literal parts). This also adds back extension support.









var dsl: { parse(s: string): PatternParts; } = require('./route-pattern-dsl');
export = RoutePattern;


// TODO: doc...
interface PatternParts {
    method: string;
    segments: { type: string; text?: string; name?: string; }[];
    rest: { index: number; name: string; };
}


/**
 * A route pattern represents a set of URLs by describing the constraints
 * that any given URL must satisfy in order to match the pattern.
 */
class RoutePattern {


    /** Construct a new RoutePattern instance. */
    constructor(source: string) {
        var parts = dsl.parse(source);
        this.method = parts.method ? parts.method.toUpperCase() : null;
        this.segments = parts.segments;
        this.rest = parts.rest;
        this.canonical = getCanonicalForm(parts);
        ensureNoDuplicateCaptureNames(this);
    }


    /** Sentinel value for a pattern that matches all URLs. */
    static UNIVERSAL = <RoutePattern> { canonical: 'U', toString: () => 'U' };


    /** Sentinel value for a pattern that matches no URLs. */
    static EMPTY = <RoutePattern> { canonical: 'E', toString: () => 'E' };


    /** The expected HTTP method. Always upper-case. May be null to indicate no expectation. */
    method: string;


    /** Array of 0:M formal segments that URLs are expected to have. */
    segments: Array<{

        /**
         * Segment type. Either 'literal' or 'capture':
         * - 'literal' segments define text that must match that found in the corresponding segment of the URL.
         * - 'capture' segments match any text found in the corresponding segment of the URL.
         */
        type: string;

        /** For 'literal' segments, the expected text of the URL's segment. Case-sensitive. */
        text?: string;

        /** For 'capture' segments, the name to which to bind the captured text. May be null. */
        name?: string;
    }>;


    /** If not null, the pattern matches URLs with zero or more segments after the formal segments. */
    rest: {

        /** TODO: doc... */        
        index: number;

        /** The name to which to bind the captured text of the 'rest' segments. May be null. */
        name: string;
    };


    /**
     * The canonical textual representation of the pattern.
     * Equivalent patterns are guaranteed to have the same value.
     */
    canonical: string;


    /**
     * A pattern may be thought of as shorthand for describing the set of URL paths
     * that match the pattern. The intersection of two patterns is thus the set of
     * URL paths that match both patterns. This function returns a pattern describing
     * this intersection set for any two given patterns.
     */
    intersectWith(other: RoutePattern): RoutePattern {
        return computeIntersection(this, other);
    }


    /**
     * Attempts to match the given request specifics against the pattern. If the
     * match is successful, returns a hash containing the name/value pairs for each
     * named capture in the pattern. If the match fails, returns null. The operation
     * is case-sensitive.
     */
    match(method: string, pathname: string): { [name: string]: string; } {
        return matchRequestAgainstPattern(this, method, pathname);
    }


    /** The string representation of a pattern is its canonical form. */
    toString() {
        return this.canonical;
    }
}


/**
 * Return the canonical textual representation of the pattern.
 * Equivalent patterns are guaranteed to return the same result.
 */
function getCanonicalForm(parts: PatternParts) {

    // Put all the pattern parts together canonically.
    var cf = (parts.method || 'ANY') + ' ';
    for (var i = 0; i < parts.segments.length; ++i) {
        if (parts.rest && i === parts.rest.index) cf += '/**';
        var s = parts.segments[i];
        cf += '/' + (s.type === 'literal' ? s.text : '*');
    }
    if (parts.rest && parts.rest.index === parts.segments.length) cf += '/**';
    return cf;
}


/** Private helper function for RoutePattern constructor. */
function ensureNoDuplicateCaptureNames(pattern: RoutePattern) {
    var names = pattern.segments.filter(s => s.type === 'capture').map(s => s.name);
    if (pattern.rest && pattern.rest.name) names.push(pattern.rest.name);
    for (var i = 0; i < names.length; ++i) {
        if (names.indexOf(names[i], i + 1) === -1) continue;
        throw new Error("Duplicate capture name '" + names[i] + "' in route pattern '" + pattern.toString() + "'");
    }
}


/** Private helper function for RoutePattern#intersectWith. */
function computeIntersection(a: RoutePattern, b: RoutePattern): RoutePattern {

    // Handle identity cases.
    if (a === RoutePattern.UNIVERSAL || b === RoutePattern.EMPTY) return b;
    if (b === RoutePattern.UNIVERSAL || a === RoutePattern.EMPTY) return a;

    // Compute the intersection of the methods.
    if (a.method && b.method && a.method !== b.method) return RoutePattern.EMPTY;
    var method = a.method || b.method;

    // Compute the intersection of the formal segments. If one pattern has more formal segments
    // than the other, the excess formal segments are considered in a subsequent step.
    var longestCommonCount = Math.min(a.segments.length, b.segments.length);
    var segments = [];
    for (var i = 0; i < longestCommonCount; ++i) {
        var segmentA = a.segments[i];
        var segmentB = b.segments[i];
        if (segmentA.type === 'literal' && segmentB.type === 'literal' && segmentA.text !== segmentB.text) return RoutePattern.EMPTY;
        var segment = segmentA.type === 'literal' ? segmentA : segmentB;
        segments.push(segment);
    }

    // Compute the intersection of the excess formal segments excluded from the previous step.
    if (Math.max(a.segments.length, b.segments.length) > longestCommonCount) {
        if (a.segments.length > longestCommonCount) {
            if (!b.rest) return RoutePattern.EMPTY;
            segments = segments.concat(a.segments.slice(longestCommonCount));
        }
        else {
            if (!a.rest) return RoutePattern.EMPTY;
            segments = segments.concat(b.segments.slice(longestCommonCount));
        }
    }

    // Compute the intersection of the 'rest' segment(s).
    var rest = a.rest && b.rest ? { index: 0, name: null } : null;

    // Return the result.
    return new RoutePattern(getCanonicalForm({ method, segments, rest }));
}


/** Private helper function for RoutePattern#match. */
function matchRequestAgainstPattern(pattern: RoutePattern, method: string, pathname: string) {
    var result: any = {};

    // Match the method.
    if (pattern.method && pattern.method !== method.toUpperCase()) return null;

    // Match the formal segments.
    var pathSegments = pathname.slice(1).split('/').map(decodeURIComponent);
    if (pathSegments.length < pattern.segments.length) return null;
    if (pathSegments.length > pattern.segments.length && !pattern.rest) return null;
    for (var i = 0; i < pattern.segments.length; ++i) {
        var patternSegment = pattern.segments[i];
        var pathSegment = pathSegments[i];
        if (patternSegment.type === 'literal') {
            if (patternSegment.text !== pathSegments[i]) return null;
        }
        else /* capture */ {
            if (patternSegment.name) result[patternSegment.name] = pathSegments[i];
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
