'use strict';
var assert = require('assert');
var pattern_1 = require('../pattern');
// TODO: review all docs below after data structure changes
// TODO: freeze after construction, make add/remove members private...
// TODO: doc...
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
     */
    Taxonomy.from = function (patterns) {
        var taxonomy = makeTaxonomy(patterns, function (pattern) { return new Taxonomy(pattern); });
        Object.freeze(taxonomy.generalizations);
        Object.freeze(taxonomy.specializations);
        // TODO: others...?
        return taxonomy;
    };
    Object.defineProperty(Taxonomy.prototype, "allPatterns", {
        // TODO: doc...
        get: function () {
            return this._allPatterns || (this._allPatterns = getAllPatterns(this));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Taxonomy.prototype, "allPathsFromHere", {
        // TODO: review doc...
        /**
         * Enumerates every possible walk[1] in the `taxonomy` DAG that begins at the this Pattern
         * and ends at any Pattern reachable from the this one. Each walk is a Pattern array,
         * whose elements are arranged in walk-order (i.e., from the root to the descendent).
         * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
         * @param {Taxonomy} taxonomy - the pattern DAG to be walked.
         * TODO: fix below....
         * @returns
         */
        get: function () {
            return this._allPathsFromHere || (this._allPathsFromHere = getAllPathsFromHere(this));
        },
        enumerable: true,
        configurable: true
    });
    return Taxonomy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Taxonomy;
// TODO: doc...
function getAllPatterns(taxonomy) {
    var allWithDups = (_a = [taxonomy.pattern]).concat.apply(_a, taxonomy.specializations.map(function (spec) { return spec.allPatterns; }));
    var resultSet = allWithDups.reduce(function (set, pat) { return set.add(pat); }, new Set());
    return Array.from(resultSet.values());
    var _a;
}
// TODO: doc...
function getAllPathsFromHere(taxonomy) {
    // TODO: test/review/cleanup...
    var allChildPaths = (_a = [[]]).concat.apply(_a, taxonomy.specializations.map(function (spec) { return spec.allPathsFromHere; }));
    return allChildPaths.map(function (childPath) { return [taxonomy.pattern].concat(childPath); });
    var _a;
}
/**
 * Arranges the given list of patterns into a directed acyclic graph (DAG), according to their set
 * relationships (recall that each pattern represents a set of addresses). The arrangement is akin
 * to a Venn diagram. The 'outermost' pattern is always the the universal set ('…'), regardless of
 * whether `patterns` contains a '…'. For any two patterns P and Q, if Q is a proper subset of P,
 * then Q will be a descendent of P in the DAG. Overlapping patterns (i.e., patterns whose
 * intersection is non-empty and where neither is a subset of the other) are represented as
 * siblings in the taxonomy. For overlapping patterns, an additional pattern representing their
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
function makeTaxonomy(patterns, factory) {
    // The rest of the algorithm assumes only normalized patterns, which we obtain here.
    var normalizedPatterns = patterns.map(function (pat) { return pat.normalized; });
    // Create the nodeFor() function to return the graph node corresponding to a given
    // pattern, creating it on demand if it doesn't already exist. This function ensures
    // that every request for the same pattern gets the same singleton node.
    var allNodes = new Map();
    var nodeFor = function (pattern) {
        var node = allNodes.get(pattern);
        if (!node) {
            node = factory(pattern);
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
    var nonDisjointComparands = nodeFor(ancestor).specializations
        .map(function (node) { return node.pattern; })
        .map(function (pattern) { return ({ pattern: pattern, intersection: insertee.intersect(pattern) }); })
        .filter(function (cmp) { return cmp.intersection !== pattern_1.default.EMPTY; });
    // If the `ancestor` pattern has no existing child patterns that are non-disjoint
    // with `insertee`, then we simply add `insertee` as a direct child of `ancestor`.
    if (nonDisjointComparands.length === 0) {
        addSpecialization(nodeFor(ancestor), nodeFor(insertee));
    }
    // If `insertee` already exists as a direct subset of `ancestor` at this point
    // (including if it was just added above), then we are done.
    if (hasSpecialization(nodeFor(ancestor), nodeFor(insertee)))
        return;
    // `insertee` has subset/superset/overlapping relationships with one or more of
    // `ancestor`'s existing child patterns. Work out how and where to insert it.
    nonDisjointComparands.forEach(function (comparand) {
        var isSubsetOfComparand = comparand.intersection === insertee;
        var isSupersetOfComparand = comparand.intersection === comparand.pattern;
        var isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;
        if (isSupersetOfComparand) {
            // Remove the comparand from `ancestor`. It will be re-inserted as a subset of `insertee` below.
            removeSpecialization(nodeFor(ancestor), nodeFor(comparand.pattern));
        }
        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `insertee` as a direct child of `ancestor`.
            addSpecialization(nodeFor(ancestor), nodeFor(insertee));
            // Recursively re-insert the comparand (or insert the overlap) as a subset of `insertee`.
            insert(comparand.intersection, insertee, nodeFor);
        }
        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `insertee` (or insert the overlap) as a subset of the comparand.
            insert(comparand.intersection, comparand.pattern, nodeFor);
        }
    });
}
// TODO: doc...
function hasSpecialization(taxonomy, spcialization) {
    return taxonomy.specializations.indexOf(spcialization) !== -1;
}
// TODO: doc...
function addSpecialization(taxonomy, specialization) {
    // NB: If the child is already there, make this a no-op.
    if (hasSpecialization(taxonomy, specialization))
        return;
    taxonomy.specializations.push(specialization);
    specialization.generalizations.push(taxonomy);
}
// TODO: doc...
function removeSpecialization(taxonomy, specialization) {
    assert(hasSpecialization(taxonomy, specialization));
    taxonomy.specializations.splice(taxonomy.specializations.indexOf(specialization), 1);
    specialization.generalizations.splice(specialization.generalizations.indexOf(taxonomy), 1);
}
//# sourceMappingURL=taxonomy.js.map