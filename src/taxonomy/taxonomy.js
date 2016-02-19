'use strict';
var insert_as_descendent_1 = require('./insert-as-descendent');
var pattern_1 = require('../pattern');
// TODO: review all docs below after data structure changes
/**
 * A taxonomy is a directed acyclic graph
 *
 * whose nodes are patterns. The graph is arranged such that
 * for any two nodes P and Q, P is an ancestor of Q iff if the addresses matched by P are a proper
 * superset of the addresses matched by Q.
 * TODO: more...
 *
 * Structurally, each Taxonomy instance may be considered both the root of a whole graph of nodes,
 * as well as an individual node within a wider graph.
 *
 */
/**
 * Arranges the given list of patterns into a directed acyclic graph (DAG), according to their set
 * relationships (recall that each pattern represents a set of addresses). The arrangement is akin
 * to a Venn diagram. The 'outermost' pattern is always the the universal set ('…'), regardless of
 * whether `patterns` contains a '…'. For any two patterns P and Q, if Q is a proper subset of P,
 * then Q will be a descendent of P in the DAG. Overlapping patterns (i.e., patterns whose
 * intersection is non-empty and where neither is a subset of the other) are represented as
 * siblings in the taxonomy.
 * NB1: For overlapping patterns, an additional pattern representing their
 * intersection is synthesized and added as a descendent of both patterns. As such, the DAG may
 * contain patterns that do not correspond to any input pattern.
 * NB2: All patterns in the returned graph are guaranteed to be normalized. As such, some of the
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
 */
var Taxonomy = (function () {
    /**
     * Constructs a new Taxonomy instance. NB: This constructor is for internal use only.
     * Use Taxonomy.from() to create a Taxonomy instance from a set of patterns.
     */
    function Taxonomy(pattern) {
        // TODO: doc...
        this.generalizations = [];
        // TODO: doc...
        this.specializations = [];
        this.pattern = pattern;
    }
    // TODO: doc better...
    /**
     * Generates a new Taxonomy instance based on the given set of patterns.
     * @param {Pattern[]} patterns - the list of patterns that make up nodes in the DAG.
     * @returns {Graph<Pattern>} A map object, whose keys are patterns and whose values
     *        are more maps. The top-level map always contains the single key '…' All
     *        patterns in the returned graph are normalized.
     */
    Taxonomy.from = function (patterns) {
        // Create the nodeFor() function to return the graph node corresponding to a given
        // pattern, creating it on demand if it doesn't already exist. This function ensures
        // that every request for the same pattern gets the same singleton node.
        var allNodes = new Map();
        var nodeFor = function (pattern) {
            if (!allNodes.has(pattern))
                allNodes.set(pattern, new Taxonomy(pattern));
            return allNodes.get(pattern);
        };
        // TODO: delegate...
        var taxonomy = makeTaxonomy(patterns, nodeFor);
        // TODO: should freeze whole graph, not just root node...
        Object.freeze(taxonomy.generalizations);
        Object.freeze(taxonomy.specializations);
        return taxonomy;
    };
    Object.defineProperty(Taxonomy.prototype, "allNodes", {
        // TODO: ========================== WIP below... All API below here is not fully baked... ===========================
        // TODO: doc...
        get: function () {
            return this._allNodes || (this._allNodes = getAllNodes(this));
        },
        enumerable: true,
        configurable: true
    });
    return Taxonomy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Taxonomy;
// TODO: doc...
function makeTaxonomy(patterns, nodeFor) {
    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    // The rest of the algorithm assumes only normalized patterns, which we obtain here.
    patterns
        .map(function (pat) { return pat.normalized; })
        .filter(function (p) { return p !== pattern_1.default.UNIVERSAL && p !== pattern_1.default.EMPTY; })
        .forEach(function (p) { return insert_as_descendent_1.default(p, pattern_1.default.UNIVERSAL, nodeFor); });
    // Return a new top-level node with the single key '…'.
    var taxonomy = nodeFor(pattern_1.default.UNIVERSAL);
    return taxonomy;
}
// TODO: doc...
function getAllNodes(taxonomy) {
    var allWithDups = (_a = [taxonomy]).concat.apply(_a, taxonomy.specializations.map(getAllNodes));
    var resultSet = allWithDups.reduce(function (set, node) { return set.add(node); }, new Set());
    return Array.from(resultSet.values());
    var _a;
}
// TODO: temp testing...
// function getAllPathsFromRootToHere(taxonomy: Taxonomy): Pattern[][] {
//     // TODO: test/review/cleanup...
//     let allPaths = [].concat(...taxonomy.generalizations.map(gen => gen.allPathsFromRootToHere));
//     if (allPaths.length === 0) allPaths = [[]]; // no parent paths - this must be the root
//     return allPaths.map(path => path.concat([taxonomy.pattern]));
// }
//# sourceMappingURL=taxonomy.js.map