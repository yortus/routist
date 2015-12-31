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
    intersectWith(other: RoutePattern): RoutePattern;

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

    /** Array of names corresponding to the pattern's captures in order. Anonymous captures have the name '?'. */
    captureNames: string[];

    /** Regex matching all pathnames recognised by this RoutePattern instance. */
    recogniser: RegExp;
}
