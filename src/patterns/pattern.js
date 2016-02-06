'use strict';
var parse_pattern_source_1 = require('./parse-pattern-source');
// TODO: review jsdocs after pattern overhaul
// TODO: ...
var normalizedPatternCache = new Map();
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
        // TODO: ...
        var patternAST = parse_pattern_source_1.default(source);
        // TODO: If the source is already normalised, return the singleton instance from the normalised pattern cache.
        // TODO: If not already cached, add this instance to the cache and preceed with construction.
        if (source === patternAST.signature) {
            var instance = normalizedPatternCache.get(source);
            if (instance)
                return instance;
            normalizedPatternCache.set(source, this);
        }
        // // TODO: ...
        // this.signature = patternAST.signature;
        // TODO: ...
        this.normalized = new Pattern(patternAST.signature);
    }
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