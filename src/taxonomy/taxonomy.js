'use strict';
var insert_as_descendent_1 = require('./insert-as-descendent');
var pattern_1 = require('../pattern');
var taxonomy_node_1 = require('./taxonomy-node');
// TODO: review all docs below after data structure changes
/**
 * A taxonomy is an arrangement of patterns into a directed acyclic graph (DAG), according to their
 * set relationships. Recall that a pattern represents a set of addresses, so two patterns may have
 * a subset, superset, disjoint, or other relationship, according to the set of addresses they match.
 * Each node in a taxonomy holds a single pattern, as well as links to all parent and child nodes.
 * Every taxonomy has a single root node that holds the universal pattern '…'. In any given taxonomy,
 * for any two nodes holding patterns P and Q, if Q is a proper subset of P, then Q will be a
 * descendent of P in the taxonomy. Overlapping patterns (i.e., patterns whose intersection is
 * non-empty but neither is a subset of the other) are siblings in the taxonomy. For overlapping
 * patterns, an additional pattern representing their intersection is synthesized and added to the
 * taxonomy as a descendent of both patterns. All patterns in a taxonomy are normalized. Some nodes
 * (such as intersection nodes) may be reached via more than one path from the root, but no two
 * nodes in a taxonomy hold the same pattern. A taxonomy may thus contain 'diamonds', making it a
 * DAG rather than a tree.
 *
 * NB: The patterns in a taxonomy may not correspond identically to its input patterns, due to (i)
 * pattern normalization, (ii) the addition of the '…' pattern if it was not among the input
 * patterns, and (iii) the addition of intersection patterns for each pair of overlapping input
 * patterns.
 *
 * For example, the input patterns ['foo', 'bar', 'f{chars}', '*o'] result in this 6-node taxonomy:
 *
 *        f*
 *      /    \
 *     /      \
 *    /        \
 * … --- *o --- f*o --- foo
 *    \
 *     \
 *      \
 *        bar
 */
var Taxonomy = (function () {
    /**
     * Constructs a new Taxonomy instance from the given list of patterns.
     * @param {Pattern[]} patterns - the list of patterns to be arranged as a DAG.
     */
    function Taxonomy(patterns) {
        initTaxonomy(this, patterns);
    }
    return Taxonomy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Taxonomy;
/** Internal helper function used by the Taxonomy constructor. */
function initTaxonomy(taxonomy, patterns) {
    // Create the nodeFor() function to return the node corresponding to a given pattern,
    // creating it on demand if it doesn't already exist. This function ensures that every
    // request for the same pattern gets the same singleton node.
    var nodeMap = new Map();
    var nodeFor = function (pattern) {
        if (!nodeMap.has(pattern))
            nodeMap.set(pattern, new taxonomy_node_1.default(pattern));
        return nodeMap.get(pattern);
    };
    // Retrieve the root node, which always corresponds to the '…' pattern.
    var rootNode = taxonomy.rootNode = nodeFor(pattern_1.default.UNIVERSAL);
    // Insert each of the given patterns, except '…' and '∅', into a DAG rooted at '…'.
    // The insertion logic assumes only normalized patterns, which we obtain first.
    patterns
        .map(function (pattern) { return pattern.normalized; })
        .filter(function (pattern) { return pattern !== pattern_1.default.UNIVERSAL && pattern !== pattern_1.default.EMPTY; })
        .forEach(function (pattern) { return insert_as_descendent_1.default(nodeFor(pattern), rootNode, nodeFor); });
    // Finally, compute the `allNodes` snapshot.
    taxonomy.allNodes = Array.from(nodeMap.values());
}
//# sourceMappingURL=taxonomy.js.map