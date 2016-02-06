'use strict';
var parse_pattern_source_1 = require('./parse-pattern-source');
/**
 * A pattern recognizes a set of addresses. It like a RegExp, but tailored
 * specifically to address recognition. Patterns are case-sensitive.
 */
var Pattern = (function () {
    /**
     * Constructs a Pattern instance.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    function Pattern(source) {
        this.source = source;
        var patternAST = parse_pattern_source_1.default(source);
        this.signature = patternAST.signature;
        // this.captureNames = patternAST.captureNames.filter(n => n !== '?');
        // this.match = makeMatchFunction(source);
    }
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
    Pattern.prototype.toString = function () { return this.source; };
    /** A singleton pattern that recognises all addresses (i.e., the universal set). */
    Pattern.UNIVERSAL = new Pattern('…');
    /** A singleton pattern that recognises no addresses (i.e., the empty set). */
    Pattern.EMPTY = new Pattern('∅');
    return Pattern;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Pattern;
//# sourceMappingURL=pattern.js.map