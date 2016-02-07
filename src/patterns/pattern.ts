'use strict';
import makeMatchFunction from './make-match-function';
import parsePatternSource from './parse-pattern-source';





/**
 * Holds a singleton instance for every normalized pattern that has been instantiated.
 * Subsequent instantiations of the same normalized pattern return the same singleton
 * instance from this map. NB: This is declared before the Pattern class to ensure it
 * is has been initialized before the the static property initializers for UNIVERSAL
 * and EMPTY are called.
 */
const normalizedPatternCache = new Map<string, Pattern>();





/**
 * A pattern recognizes a set of addresses. It is like a RegExp, but tailored
 * specifically to address recognition. Pattern instances that represent normalized
 * patterns are always singletons. Consult the documentation for information about
 * the pattern DSL used to construct Pattern instances.
 */
export default class Pattern {


    /**
     * Constructs or returns a Pattern instance. If `source` represents a normalized pattern,
     * the corresponding singleton instance of that normalized pattern will be returned.
     * Otherwise, a new Pattern instance will be constructed.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    constructor(private source: string) {

        // Parse the source string to test its validity and to get syntax information. NB: may throw.
        let ast = parsePatternSource(source);

        // If the source is already normalised, return the singleton instance from the normalised pattern cache.
        if (source === ast.signature) {
            let instance = normalizedPatternCache.get(source);
            if (instance) return instance;

            // If not already cached, add this instance to the cache and preceed with construction.
            normalizedPatternCache.set(source, this);
        }

        // Initialize members.
        this.normalized = new Pattern(ast.signature); // NB: recursive.
        this.captureNames = ast.captures.filter(capture => capture !== '?');
        this.match = makeMatchFunction(source, ast);
    }


    /**
     * The normalized form of this pattern, which recognizes the same set of addresses as
     * this instance. Two patterns that recognize the same set of addresses are guaranteed
     * to have the same normalized form.
     */
    normalized: Pattern;


    /**
     * A string array whose elements correspond, in order, to the named captures in the pattern.
     * For example, the pattern '{...path}/*.{ext}' has the `captureNames` value ['path', 'ext'].
     */
    captureNames: string[];


    /**
     * Attempts to match a given address against this pattern. If the match is successful, an
     * object is returned containing the name/value pairs for each named capture in the pattern.
     * If the match fails, the return value is null.
     * NB: The matching operation is case-sensitive.
     * @param {string} address - the address to match against this pattern.
     * @returns {Object} null if the match failed, otherwise a hash of captured name/value pairs.
     */
    match: (address: string) => {[captureName: string]: string};


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises all addresses (i.e., the universal set). */
    static UNIVERSAL = new Pattern('…');


    /** A singleton pattern that recognises no addresses (i.e., the empty set). */
    static EMPTY = new Pattern('∅');
}
