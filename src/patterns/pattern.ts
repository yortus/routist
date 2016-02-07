'use strict';
import makeMatchFunction, {MatchFunction} from './make-match-function';
import parsePatternSource from './parse-pattern-source';
// TODO: review jsdocs after pattern overhaul





// TODO: ...
const normalizedPatternCache = new Map<string, Pattern>();





/**
 * A pattern recognizes a set of addresses. It like a RegExp, but tailored
 * specifically to address recognition. Patterns are case-sensitive.
 */
export default class Pattern {


    /**
     * Constructs a Pattern instance.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    constructor(private source: string) {

        // TODO: ...
        let patternAST = parsePatternSource(source);

        // TODO: If the source is already normalised, return the singleton instance from the normalised pattern cache.
        // TODO: If not already cached, add this instance to the cache and preceed with construction.
        if (source === patternAST.signature) {
            let instance = normalizedPatternCache.get(source);
            if (instance) return instance;
            normalizedPatternCache.set(source, this);
        }

        // TODO: ...
        this.normalized = new Pattern(patternAST.signature);
        this.match = makeMatchFunction(patternAST);
    }


    // TODO: doc...
    normalized: Pattern;


    // TODO: doc...
    match: MatchFunction;


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises all addresses (i.e., the universal set). */
    static UNIVERSAL = new Pattern('…');


    /** A singleton pattern that recognises no addresses (i.e., the empty set). */
    static EMPTY = new Pattern('∅');
}
