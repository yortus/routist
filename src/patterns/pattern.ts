'use strict';
import makeMatchFunction from './make-match-function';
import parsePatternSource from './parse-pattern-source';





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
        let patternAST = parsePatternSource(source);
        this.signature = patternAST.signature;
    }


    /**
     * The signature of this pattern. Two patterns that match the same set of
     * addresses are guaranteed to have the same signature.
     */
    signature: string;


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises all addresses (i.e., the universal set). */
    static UNIVERSAL = new Pattern('…');


    /** A singleton pattern that recognises no addresses (i.e., the empty set). */
    static EMPTY = new Pattern('∅');
}
