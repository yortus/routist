'use strict';
var intersect_patterns_1 = require('./intersect-patterns');
var pattern_1 = require('./pattern');
/**
 * Arranges the given list of patterns into a hierarchy according to their set
 * relationships (recall that each pattern represents a set of addresses). The
 * arrangement is akin to a Venn diagram. The 'outermost' pattern is always the
 * the universal set ('…'), regardless of whether `patterns` contains a '…'.
 * For any two patterns p1 and p2, if p2 is a proper subset of p1, then it will
 * be a descendent of p1 in the hierarchy. Overlapping patterns (i.e., patterns
 * whose intersection is non-empty and neither is a subset of the other) are
 * represented as siblings in the hierarchy. For overlapping patterns, an
 * additional pattern representing their intersection is synthesized and added
 * as a descendent of both patterns. The hierarchy is thus a directed acyclic
 * graph (DAG).
 *
 * For example, the patterns ['/foo', '/bar', '/f*', '/*o'] result in the DAG:
 * …
 * |-- /bar
 * |-- /f*
 * |   |-- /f*o
 * |       |-- /foo
 * |-- /*o
 *     |-- /f*o
 *         |-- /foo
 *
 * @param {Pattern[]} patterns - the list of patterns to go into the hierarchy.
 * @returns {Object} A 'node' object, whose keys are pattern signatures and
 *        whose values are more 'nodes'. The returned node always contains the
 *        single key '…'.
 */
function hierarchizePatterns(patterns) {
    // Create the nodeFor() function to return nodes from a single associative array
    // of patterns, creating them on demand if they don't exist. This ensures every
    // request for the same pattern gets the same singleton node.
    var map = {};
    var nodeFor = function (pattern) { return map[pattern] || (map[pattern] = {}); };
    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    var root = new pattern_1.default('…');
    patterns
        .filter(function (p) { return p.signature !== '…' && p.signature !== '∅'; })
        .forEach(function (pattern) { return insert(pattern.signature, '…', nodeFor); });
    // Return a top-level node with the single key '…'.
    return { '…': nodeFor('…') };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hierarchizePatterns;
/**
 * Inserts `pattern` into the appropriate position in the DAG rooted at `superset`.
 * `pattern` must be a proper subset of `superset`, and must not be '∅'.
 * @param {string} pattern - The new pattern to be inserted into the DAG.
 * @param {string} superset - The root pattern of the subgraph of the DAG, below
 *        which `pattern` is to be inserted.
 * @param {(pattern: string) => PatternHierarchy} nodeFor - A callback used by the
 *        function to map patterns to their corresponding nodes on demand.
 */
function insert(pattern, superset, nodeFor) {
    // Compute information about all the existing direct subsets of `superset`.
    // We only care about the ones that are non-disjoint with `pattern`.
    var nonDisjointComparands = Object.keys(nodeFor(superset))
        .map(function (p) { return ({ pattern: p, intersection: intersect_patterns_1.default(pattern, p).signature }); })
        .filter(function (cmp) { return cmp.intersection !== '∅'; });
    // If `superset` has no direct subsets that are non-disjoint with `pattern`, then we
    // simply add `pattern` as a direct subset of `superset`.
    if (nonDisjointComparands.length === 0) {
        nodeFor(superset)[pattern] = nodeFor(pattern);
    }
    // If `pattern` already exists as a direct subset of `superset` at this stage
    // (including if it was just added above), then we are done.
    if (nodeFor(superset)[pattern])
        return;
    // `pattern` has subset/superset/overlapping relationships with one or more of
    // `superset`'s existing direct subsets. Work out how and where to insert it.
    nonDisjointComparands.forEach(function (comparand) {
        var isSubsetOfComparand = comparand.intersection === pattern;
        var isSupersetOfComparand = comparand.intersection === comparand.pattern;
        var isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;
        if (isSupersetOfComparand) {
            // Remove the comparand from `superset`. It will be re-inserted as a subset of `pattern` below.
            delete nodeFor(superset)[comparand.pattern];
        }
        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `pattern` as a direct subset of `superset`.
            nodeFor(superset)[pattern] = nodeFor(pattern);
            // Recursively re-insert the comparand (or insert the overlap) as a subset of `pattern`.
            insert(comparand.intersection, pattern, nodeFor);
        }
        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `pattern` (or insert the overlap) as a subset of the comparand.
            insert(comparand.intersection, comparand.pattern, nodeFor);
        }
    });
}
//# sourceMappingURL=hierarchize-patterns.js.map