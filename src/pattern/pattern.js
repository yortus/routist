'use strict';
var intersect_patterns_1 = require('./intersect-patterns');
var make_pattern_matcher_1 = require('./make-pattern-matcher');
var parse_pattern_source_1 = require('./parse-pattern-source');
/**
 * Holds a singleton instance for every normalized pattern that has been instantiated.
 * Subsequent instantiations of the same normalized pattern return the same singleton
 * instance from this map. NB: This is declared before the Pattern class to ensure it
 * is has been initialized before the the static property initializers for UNIVERSAL
 * and EMPTY are called.
 */
var normalizedPatternCache = new Map();
/**
 * A pattern recognizes a set of addresses. It is like a RegExp, but tailored
 * specifically to address recognition. Pattern instances that represent normalized
 * patterns are always singletons. Consult the documentation for information about
 * the pattern DSL used to construct Pattern instances.
 * NB: All operations on patterns are case-sensitive.
 */
var Pattern = (function () {
    /**
     * Constructs or returns a Pattern instance. If `source` represents a normalized pattern,
     * the corresponding singleton instance of that normalized pattern will be returned.
     * Otherwise, a new Pattern instance will be constructed.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    function Pattern(source) {
        this.source = source;
        // Parse the source string to test its validity and to get syntax information. NB: may throw.
        var ast = parse_pattern_source_1.default(source);
        // If the source is already normalised, return the singleton instance from the normalised pattern cache.
        if (source === ast.signature) {
            var instance = normalizedPatternCache.get(source);
            if (instance)
                return instance;
            // If not already cached, add this instance to the cache and preceed with construction.
            normalizedPatternCache.set(source, this);
        }
        // Initialize members.
        this.normalized = new Pattern(ast.signature); // NB: recursive.
        this.captureNames = ast.captures.filter(function (capture) { return capture !== '?'; });
        this.match = make_pattern_matcher_1.default(source, ast);
        this.comment = source.split('#')[1] || '';
    }
    /**
     * Returns a new pattern that matches all the addresses that are matched by *both* this
     * pattern and the `other` pattern. Returns the empty pattern '∅' if there are no addresses
     * matched by both patterns. Throws an error if the intersection cannot be expressed as a
     * single pattern. The resulting pattern is guaranteed to be normalized.
     * @param {Pattern} other - a pattern instance. May or may not be normalized.
     * @returns {Pattern} - a normalized pattern representing the set of addresses S,
     *        such that R ∈ S iff R ∈ `this` and R ∈ `other`.
     */
    Pattern.prototype.intersect = function (other) {
        return intersect_patterns_1.default(this, other);
    };
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