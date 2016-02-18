'use strict';
import * as assert from 'assert';
import Pattern from '../pattern';
// TODO: review all docs below after data structure changes
// TODO: freeze after construction, make add/remove members private...





// TODO: doc...
export default class Taxonomy {


    // TODO: doc...
    constructor(patterns: Pattern|Pattern[]) {
        if (Array.isArray(patterns)) {
            // TODO: but should return *this* instance!
            return makeTaxonomy(patterns);
        }
        else {
            this.pattern = patterns;
        }
    }


    // TODO: doc...
    pattern: Pattern;


    // TODO: doc...
    generalizations: Taxonomy[] = [];


    // TODO: doc...
    specializations: Taxonomy[] = [];


    // TODO: doc...
    get allPatterns(): Pattern[] {
        let allWithDups = [this.pattern].concat(...this.specializations.map(spec => spec.allPatterns));
        let resultSet = allWithDups.reduce((set, pat) => set.add(pat), new Set<Pattern>());
        return Array.from(resultSet.values());
    }


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
    get allPathsFromHere(): Pattern[][] {

        // TODO: test/review/cleanup...

        let allChildPaths: Pattern[][] = [[]].concat(...this.specializations.map(spec => spec.allPathsFromHere));
        
        let x = allChildPaths.map(childPath => [this.pattern].concat(childPath));

        return x;

    }


    // TODO: doc...
    hasSpecialization(spcialization: Taxonomy): boolean {
        return this.specializations.indexOf(spcialization) !== -1;
    }


    // TODO: doc...
    // TODO: should be 'internal' to makeTaxonomy...
    addSpecialization(specialization: Taxonomy) {
        // NB: If the child is already there, make this a no-op.
        if (this.hasSpecialization(specialization)) return;
        this.specializations.push(specialization);
        specialization.generalizations.push(this);
    }


    // TODO: doc...
    // TODO: should be 'internal' to makeTaxonomy...
    removeSpecialization(specialization: Taxonomy) {
        assert(this.hasSpecialization(specialization));
        this.specializations.splice(this.specializations.indexOf(specialization), 1);
        specialization.generalizations.splice(specialization.generalizations.indexOf(this), 1);
    }
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
function makeTaxonomy(patterns: Pattern[]): Taxonomy {

    // The rest of the algorithm assumes only normalized patterns, which we obtain here.
    let normalizedPatterns = patterns.map(pat => pat.normalized);

    // Create the nodeFor() function to return the graph node corresponding to a given
    // pattern, creating it on demand if it doesn't already exist. This function ensures
    // that every request for the same pattern gets the same singleton node.
    let allNodes = new Map<Pattern, Taxonomy>();
    let nodeFor = (pattern: Pattern) => {
        let node = allNodes.get(pattern);
        if (!node) {
            node = new Taxonomy(pattern);
            allNodes.set(pattern, node);
        }
        return node;
    }

    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    normalizedPatterns
        .filter(p => p !== Pattern.UNIVERSAL && p !== Pattern.EMPTY)
        .forEach(p => insert(p, Pattern.UNIVERSAL, nodeFor));

    // Return a new top-level node with the single key '…'.
    return nodeFor(Pattern.UNIVERSAL);
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
function insert(insertee: Pattern, ancestor: Pattern, nodeFor: (pattern: Pattern) => Taxonomy) {

    // Compute information about all the existing child patterns of the `ancestor` pattern.
    // NB: we only care about the ones that are non-disjoint with `insertee`.
    let nonDisjointComparands = nodeFor(ancestor).specializations
        .map(node => node.pattern)
        .map(pattern => ({ pattern, intersection: insertee.intersect(pattern) }))
        .filter(cmp => cmp.intersection !== Pattern.EMPTY);

    // If the `ancestor` pattern has no existing child patterns that are non-disjoint
    // with `insertee`, then we simply add `insertee` as a direct child of `ancestor`.
    if (nonDisjointComparands.length === 0) {
        nodeFor(ancestor).addSpecialization(nodeFor(insertee));
    }

    // If `insertee` already exists as a direct subset of `ancestor` at this point
    // (including if it was just added above), then we are done.
    if (nodeFor(ancestor).hasSpecialization(nodeFor(insertee))) return;

    // `insertee` has subset/superset/overlapping relationships with one or more of
    // `ancestor`'s existing child patterns. Work out how and where to insert it.
    nonDisjointComparands.forEach(comparand => {
        let isSubsetOfComparand = comparand.intersection === insertee;
        let isSupersetOfComparand = comparand.intersection === comparand.pattern;
        let isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;

        if (isSupersetOfComparand) {
            // Remove the comparand from `ancestor`. It will be re-inserted as a subset of `insertee` below.
            nodeFor(ancestor).removeSpecialization(nodeFor(comparand.pattern));
        }

        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `insertee` as a direct child of `ancestor`.
            nodeFor(ancestor).addSpecialization(nodeFor(insertee));

            // Recursively re-insert the comparand (or insert the overlap) as a subset of `insertee`.
            insert(comparand.intersection, insertee, nodeFor);
        }

        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `insertee` (or insert the overlap) as a subset of the comparand.
            insert(comparand.intersection, comparand.pattern, nodeFor);
        }
    });
}
