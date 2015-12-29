export function main(): Promise<any>;


/**
 * A route pattern represents a set of URLs by describing the constraints
 * that any given URL must satisfy in order to match the pattern.
 */
export class RoutePattern {


    /** Construct a new RoutePattern instance. */
    constructor(source: string);


    /** Sentinel value for a pattern that matches all URLs. */
    static UNIVERSAL: RoutePattern;


    /** Sentinel value for a pattern that matches no URLs. */
    static EMPTY: RoutePattern;


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

        /** The name to which to bind the captured text of the 'rest' segments. May be null. */
        name: string;
    };


    /** The expected extension. Case-sensitive. May be null to indicate no expectation. */
    extension: string;


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
    intersectWith(other: RoutePattern): RoutePattern;


    /**
     * Attempts to match the given request specifics against the pattern. If the
     * match is successful, returns a hash containing the name/value pairs for each
     * named capture in the pattern. If the match fails, returns null. The operation
     * is case-sensitive.
     */
    match(method: string, pathname: string): { [name: string]: string; };


    /** The string representation of a pattern is its canonical form. */
    toString(): string;
}
