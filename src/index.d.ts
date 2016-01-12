export function main(): Promise<any>;





/**
 * A RoutePattern matches a particular set of pathnames that conform to a textual pattern.
 */
export class RoutePattern {


    /**
     * Creates a new RoutePattern instance from the given pattern string.
     * The pattern string consists of a sequence of the following elements:
     * - literal characters (alphanumerics, underscore, period and hyphen)
     * - globstar captures ('**' or '…' for anonymous capture, or '{...name}' for named capture)
     * - wildcard captures ('*' for anonymous capture, or '{name}' for named capture)
     * - path separator ('/')
     * Additional rules:
     * - a globstar capture matches 0..M characters, each of which which may be anything
     * - a wildcard capture matches 0..M characters, each of which which may be anything except '/'
     * - captures may not be directly adjacent to one another in a pattern
     * - path separators may not be directly adjacent to one another in a pattern
     * - the single character '∅' is a valid pattern representing the set containing no pathnames
     * - the single character '…' is a valid pattern representing the set containing all pathnames
     */
    constructor(pattern: string);


    /** Sentinel value for a pattern that matches all pathnames. */
    static ALL: RoutePattern;


    /** Sentinel value for a pattern that matches no pathnames. */
    static NONE: RoutePattern;


    /**
     * Returns a new RoutePattern instance that matches all the pathnames that are
     * matched by *both* `this` and `other`. Returns NEVER_MATCH if there are no
     * such pathnames. Throws an error if the intersection cannot be expressed as a
     * single pattern.
     * NB: The operation is case-sensitive.
     */
    intersect(other: RoutePattern): RoutePattern;


    /**
     * Computes the relationship between this RoutePattern instance and another
     * RoutePattern instance in terms of the sets of pathnames each one matches.
     * The possible relations are:
     * - Equal: both instances match the same set of pathnames
     * - Subset: every pathname matched by `this` is also matched by `other`
     * - Superset: every pathname matched by `other` is also matched by `this`
     * - Disjoint: no pathname is matched by both `this` and `other`
     * - Overlapping: none of the other four relationships are true.
     */
    compare(other: RoutePattern);


    /**
     * Attempts to match the given pathname against the pattern. If the match
     * is successful, returns a hash containing the name/value pairs for each
     * named capture in the pattern. If the match fails, returns null.
     * NB: The operation is case-sensitive.
     */
    match(pathname: string): { [name: string]: string; };


    /** The string representation of a pattern is its canonical form. */
    toString(): string;


    /**
     * The canonical textual representation of the pattern.
     * Equivalent patterns are guaranteed to have the same value.
     */
    canonical: string;
}





/** Enumeration for classifying the relationship between two RoutePattern instances. */
export const enum RoutePatternRelation {
    Equal = 1,
    Subset = 2,
    Superset = 3,
    Disjoint = 4,
    Overlapping = 5
}





// TODO: ...
export class RouteFamily {
    constructor(pattern: RoutePattern);
    item: RoutePattern;
    children: RouteFamily[];
    insert(item: RoutePattern);
    toString(): string;
}
