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
        // this.captureNames = patternAST.captureNames.filter(n => n !== '?');
        // this.match = makeMatchFunction(source);
    }


    /**
     * The signature of this pattern. Two patterns that match the same set of
     * addresses are guaranteed to have the same signature.
     */
    signature: string;


//     /**
//      * An array of the named captures present in the pattern, in order. For example, the pattern
//      * '{...path}/*.{ext}' will have a `captureNames` property with the value ['path', 'ext'].
//      */
//     captureNames: string[];
// 
// 
//     /**
//      * Attempts to match a given address against the pattern. For successful matches, a hash
//      * is returned containing the name/value pairs for each named capture in the pattern. For
//      * failed matches the return value is null.
//      * @param {string} address - the address to match against the pattern.
//      * @returns {Object} null if the match failed, otherwise a hash of captured name/value pairs.
//      */
//     match: (address: string) => {[captureName: string]: string};


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises all addresses (i.e., the universal set). */
    static UNIVERSAL = new Pattern('…');


    /** A singleton pattern that recognises no addresses (i.e., the empty set). */
    static EMPTY = new Pattern('∅');
}
