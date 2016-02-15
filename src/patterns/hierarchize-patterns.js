'use strict';
var assert = require('assert');
var intersect_patterns_1 = require('./intersect-patterns');
var pattern_1 = require('./pattern');
// TODO: review all docs below after data structure changes
// TODO: temp testing
var PatternNode = (function () {
    function PatternNode(pattern) {
        this.pattern = pattern;
        this.parents = [];
        this.children = [];
    }
    PatternNode.prototype.hasChild = function (childNode) {
        return this.children.indexOf(childNode) !== -1;
    };
    PatternNode.prototype.addChild = function (childNode) {
        // NB: If the child is already there, make this a no-op.
        if (this.hasChild(childNode))
            return;
        this.children.push(childNode);
        childNode.parents.push(this);
    };
    PatternNode.prototype.removeChild = function (childNode) {
        assert(this.hasChild(childNode));
        this.children.splice(this.children.indexOf(childNode), 1);
        childNode.parents.splice(childNode.parents.indexOf(this), 1);
    };
    return PatternNode;
}());
exports.PatternNode = PatternNode;
/**
 * Arranges the given list of patterns into a directed acyclic graph (DAG), according to their set
 * relationships (recall that each pattern represents a set of addresses). The arrangement is akin
 * to a Venn diagram. The 'outermost' pattern is always the the universal set ('…'), regardless of
 * whether `patterns` contains a '…'. For any two patterns P and Q, if Q is a proper subset of P,
 * then Q will be a descendent of P in the DAG. Overlapping patterns (i.e., patterns whose
 * intersection is non-empty and where neither is a subset of the other) are represented as
 * siblings in the hierarchy. For overlapping patterns, an additional pattern representing their
 * intersection is synthesized and added as a descendent of both patterns.
 * NB: All patterns in the returned graph are guaranteed to be normalized. As such, some of the
 * input `patterns` may not appear in the output graph, but their normalized equivalents will.
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
 * @param {Pattern[]} patterns - the list of patterns that make up nodes in the DAG.
 * @returns {Graph<Pattern>} A map object, whose keys are patterns and whose values
 *        are more maps. The top-level map always contains the single key '…' All
 *        patterns in the returned graph are normalized.
 */
function hierarchizePatterns(patterns) {
    // The rest of the algorithm assumes only normalized patterns, which we obtain here.
    var normalizedPatterns = patterns.map(function (pat) { return pat.normalized; });
    // Create the nodeFor() function to return the graph node corresponding to a given
    // pattern, creating it on demand if it doesn't already exist. This function ensures
    // that every request for the same pattern gets the same singleton node.
    var allNodes = new Map();
    var nodeFor = function (pattern) {
        var node = allNodes.get(pattern);
        if (!node) {
            node = new PatternNode(pattern);
            allNodes.set(pattern, node);
        }
        return node;
    };
    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    normalizedPatterns
        .filter(function (p) { return p !== pattern_1.default.UNIVERSAL && p !== pattern_1.default.EMPTY; })
        .forEach(function (p) { return insert(p, pattern_1.default.UNIVERSAL, nodeFor); });
    // Return a new top-level node with the single key '…'.
    return nodeFor(pattern_1.default.UNIVERSAL);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hierarchizePatterns;
/**
 * Inserts `pattern` into the appropriate position in the DAG rooted at `superset`.
 * `pattern` must be a proper subset of `superset`, and must not be '∅'.
 * @param {Pattern} insertee - the new pattern to be inserted into the DAG.
 * @param {Pattern} ancestor - the root pattern of the subgraph of the DAG in which
 *        `insertee` belongs.
 * @param {(pattern: Pattern) => Graph<Pattern>} nodeFor - a callback used by the
 *        function to map patterns to their corresponding graph nodes on demand.
 */
function insert(insertee, ancestor, nodeFor) {
    // Compute information about all the existing child patterns of the `ancestor` pattern.
    // NB: we only care about the ones that are non-disjoint with `insertee`.
    var nonDisjointComparands = nodeFor(ancestor).children
        .map(function (node) { return node.pattern; })
        .map(function (pattern) { return ({ pattern: pattern, intersection: intersect_patterns_1.default(insertee, pattern) }); })
        .filter(function (cmp) { return cmp.intersection !== pattern_1.default.EMPTY; });
    // If the `ancestor` pattern has no existing child patterns that are non-disjoint
    // with `insertee`, then we simply add `insertee` as a direct child of `ancestor`.
    if (nonDisjointComparands.length === 0) {
        nodeFor(ancestor).addChild(nodeFor(insertee));
    }
    // If `insertee` already exists as a direct subset of `ancestor` at this point
    // (including if it was just added above), then we are done.
    if (nodeFor(ancestor).hasChild(nodeFor(insertee)))
        return;
    // `insertee` has subset/superset/overlapping relationships with one or more of
    // `ancestor`'s existing child patterns. Work out how and where to insert it.
    nonDisjointComparands.forEach(function (comparand) {
        var isSubsetOfComparand = comparand.intersection === insertee;
        var isSupersetOfComparand = comparand.intersection === comparand.pattern;
        var isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;
        if (isSupersetOfComparand) {
            // Remove the comparand from `ancestor`. It will be re-inserted as a subset of `insertee` below.
            nodeFor(ancestor).removeChild(nodeFor(comparand.pattern));
        }
        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `insertee` as a direct child of `ancestor`.
            nodeFor(ancestor).addChild(nodeFor(insertee));
            // Recursively re-insert the comparand (or insert the overlap) as a subset of `insertee`.
            insert(comparand.intersection, insertee, nodeFor);
        }
        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `insertee` (or insert the overlap) as a subset of the comparand.
            insert(comparand.intersection, comparand.pattern, nodeFor);
        }
    });
}
//# sourceMappingURL=hierarchize-patterns.js.map