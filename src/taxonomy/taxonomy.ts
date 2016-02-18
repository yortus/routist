'use strict';
import insertAsDescendent from './insert-as-descendent';
import Pattern from '../pattern';
// TODO: review all docs below after data structure changes





/**
 * A taxonomy is a directed acyclic graph whose nodes are patterns. The graph is arranged such that
 * for any two nodes P and Q, P is an ancestor of Q iff if the addresses matched by P are a proper
 * superset of the addresses matched by Q.
 * TODO: more...
 */
export default class Taxonomy {


    /**
     * Constructs a new Taxonomy instance. NB: This constructor is for internal use only.
     * Use Taxonomy.from() to create a Taxonomy instance from a set of patterns.
     */
    private constructor(pattern: Pattern) {
        this.pattern = pattern;
    }


    // TODO: doc better...
    /**
     * Generates a new Taxonomy instance based on the given set of patterns.
     */
    static from(patterns: Pattern[]) {
        let taxonomy = makeTaxonomy(patterns, pattern => new Taxonomy(pattern));

        // TODO: should freeze whole graph, not just root node...
        Object.freeze(taxonomy.generalizations);
        Object.freeze(taxonomy.specializations);

        return taxonomy;
    }


    // TODO: doc...
    pattern: Pattern;


    // TODO: doc...
    generalizations: Taxonomy[] = [];


    // TODO: doc...
    specializations: Taxonomy[] = [];


    // TODO: ========================== WIP below... All API below here is not fully baked... ===========================
    // TODO: doc...
    get allPatterns(): Pattern[] {
        return this._allPatterns || (this._allPatterns = getAllPatterns(this));
    }


    // TODO: review doc...
    // TODO: badly named...
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
        return this._allPathsFromHere || (this._allPathsFromHere = getAllPathsFromHere(this));
    }


    /** Holds the memoized value return by the Taxonomy#allPatterns getter. */
    private _allPatterns: Pattern[];


    /** Holds the memoized value return by the Taxonomy#allPathsFromHere getter. */
    private _allPathsFromHere: Pattern[][];
}





// TODO: doc...
function getAllPatterns(taxonomy: Taxonomy): Pattern[] {
    let allWithDups = [taxonomy.pattern].concat(...taxonomy.specializations.map(spec => spec.allPatterns));
    let resultSet = allWithDups.reduce((set, pat) => set.add(pat), new Set<Pattern>());
    return Array.from(resultSet.values());
}





// TODO: doc...
function getAllPathsFromHere(taxonomy: Taxonomy): Pattern[][] {
    // TODO: test/review/cleanup...
    let allChildPaths: Pattern[][] = [[]].concat(...taxonomy.specializations.map(spec => spec.allPathsFromHere));
    return allChildPaths.map(childPath => [taxonomy.pattern].concat(childPath));
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
function makeTaxonomy(patterns: Pattern[], factory: (pattern: Pattern) => Taxonomy): Taxonomy {

    // The rest of the algorithm assumes only normalized patterns, which we obtain here.
    let normalizedPatterns = patterns.map(pat => pat.normalized);

    // Create the nodeFor() function to return the graph node corresponding to a given
    // pattern, creating it on demand if it doesn't already exist. This function ensures
    // that every request for the same pattern gets the same singleton node.
    let allNodes = new Map<Pattern, Taxonomy>();
    let nodeFor = (pattern: Pattern) => {
        let node = allNodes.get(pattern);
        if (!node) {
            node = factory(pattern);
            allNodes.set(pattern, node);
        }
        return node;
    }

    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    normalizedPatterns
        .filter(p => p !== Pattern.UNIVERSAL && p !== Pattern.EMPTY)
        .forEach(p => insertAsDescendent(p, Pattern.UNIVERSAL, nodeFor));

    // Return a new top-level node with the single key '…'.
    let taxonomy = nodeFor(Pattern.UNIVERSAL);
    return taxonomy;
}
