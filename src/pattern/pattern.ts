import intersectPatterns from './intersect-patterns';
import makePatternMatcher from './make-pattern-matcher';
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
 * NB: All operations on patterns are case-sensitive.
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
        this.match = makePatternMatcher(source, ast);
        this.comment = source.split('#')[1] || '';
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
     * @param {string} address - the address to match against this pattern.
     * @returns {Object} null if the match failed, otherwise a hash of captured name/value pairs.
     */
    match: (address: string) => {[captureName: string]: string};


    /**
     * Returns a new pattern that matches all the addresses that are matched by *both* this
     * pattern and the `other` pattern. Returns the empty pattern '∅' if there are no addresses
     * matched by both patterns. Throws an error if the intersection cannot be expressed as a
     * single pattern. The resulting pattern is guaranteed to be normalized.
     * @param {Pattern} other - a pattern instance. May or may not be normalized.
     * @returns {Pattern} - a normalized pattern representing the set of addresses S,
     *        such that R ∈ S iff R ∈ `this` and R ∈ `other`.
     */
    intersect(other: Pattern): Pattern[] {
        // TODO: improve formatting...
        return intersectPatterns(this.normalized.toString(), other.normalized.toString())
            .map(src => new Pattern(src));
    }


// TODO: toIdentifier would be better/simpler. Just prepend a '_' (or something else better?) if result would not otherwise be a valid identifier...

    /**
     * Returns a string that is visually similar to the normalized source of this pattern, but
     * where every character is a valid IdentifierPart according to the ECMAScript grammar
     * (see http://www.ecma-international.org/ecma-262/6.0/index.html#sec-names-and-keywords).
     * NB: The returned string is not guaranteed to be a valid Identifier or IdentifierName,
     * since the first character may not be a valid IdentifierStart, or the entire string may
     * match a reserved word. It is the caller's responsibility to deal with this as needed.
    */
    toIdentifierParts(): string {
        return this.normalized.source
            .split('')
            .map(c => {
                if (/[a-zA-Z0-9_]/.test(c)) return c;
                if (c === '/') return 'ﾉ'; // (U+FF89)
                if (c === '.') return 'ˌ'; // (U+02CC)
                if (c === '-') return 'ￚ'; // (U+FFDA)
                if (c === ' ') return 'ㆍ'; // (U+318D)
                if (c === '…') return '﹍'; // (U+FE4D)
                if (c === '*') return 'ᕽ'; // (U+157D)
                if (c === '∅') return 'Ø' // (U+00F8)
                throw new Error(`Unrecognized character '${c}' in pattern '${this}'`); // sanity check
            })
            .join('');
    }    


    /** The text of the comment portion of the pattern source, or '' if there is no comment. */
    comment: string;


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises all addresses (i.e., the universal set). */
    static UNIVERSAL = new Pattern('…');


    /** A singleton pattern that recognises no addresses (i.e., the empty set). */
    static EMPTY = new Pattern('∅');
}
