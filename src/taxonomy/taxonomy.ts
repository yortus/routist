'use strict';
import insertAsDescendent from './insert-as-descendent';
import Pattern from '../pattern';
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
     * @param {Pattern[]} patterns - the list of patterns that make up nodes in the DAG.
     * @returns {Graph<Pattern>} A map object, whose keys are patterns and whose values
     *        are more maps. The top-level map always contains the single key '…' All
     *        patterns in the returned graph are normalized.
     */
    static from(patterns: Pattern[]) {

        // Create the nodeFor() function to return the graph node corresponding to a given
        // pattern, creating it on demand if it doesn't already exist. This function ensures
        // that every request for the same pattern gets the same singleton node.
        let allNodes = new Map<Pattern, Taxonomy>();
        let nodeFor = (pattern: Pattern) => {
            if (!allNodes.has(pattern)) allNodes.set(pattern, new Taxonomy(pattern));
            return allNodes.get(pattern);
        }

        // TODO: delegate...
        let taxonomy = makeTaxonomy(patterns, nodeFor);

        // TODO: freeze whole graph...
        taxonomy.allNodes.forEach(node => {
            Object.freeze(node.generalizations);
            Object.freeze(node.specializations);
        });

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
    // TODO: this is called in Pattern.from, so there's no point in having this lazy getter...
    // TODO: badly named - does not include generalizations... Should it (ie every node has list of all graph nodes?)
    get allNodes(): Taxonomy[] {
        return this._allNodes || (this._allNodes = getAllNodes(this));
    }


    /** Holds the memoized value return by the Taxonomy#allNodes getter. */
    private _allNodes: Taxonomy[];
}





// TODO: doc...
function makeTaxonomy(patterns: Pattern[], nodeFor: (pattern: Pattern) => Taxonomy): Taxonomy {

    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    // The rest of the algorithm assumes only normalized patterns, which we obtain here.
    patterns
        .map(pat => pat.normalized)
        .filter(p => p !== Pattern.UNIVERSAL && p !== Pattern.EMPTY)
        .forEach(p => insertAsDescendent(p, Pattern.UNIVERSAL, nodeFor));

    // Return a new top-level node with the single key '…'.
    let taxonomy = nodeFor(Pattern.UNIVERSAL);
    return taxonomy;
}





// TODO: doc...
function getAllNodes(taxonomy: Taxonomy): Taxonomy[] {
    let allWithDups = [taxonomy].concat(...taxonomy.specializations.map(getAllNodes));
    let resultSet = allWithDups.reduce((set, node) => set.add(node), new Set<Taxonomy>());
    return Array.from(resultSet.values());
}
