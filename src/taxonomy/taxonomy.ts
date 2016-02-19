'use strict';
import insertAsDescendent from './insert-as-descendent';
import Pattern from '../pattern';
import TaxonomyNode from './taxonomy-node';
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


    // TODO: doc better...
    /**
     * Constructs a new Taxonomy instance based on the given set of patterns.
     * @param {Pattern[]} patterns - the list of patterns that make up nodes in the DAG.
     * @returns {Graph<Pattern>} A map object, whose keys are patterns and whose values
     *        are more maps. The top-level map always contains the single key '…' All
     *        patterns in the returned graph are normalized.
     */
    constructor(patterns: Pattern[]) {

        // Create the nodeFor() function to return the graph node corresponding to a given
        // pattern, creating it on demand if it doesn't already exist. This function ensures
        // that every request for the same pattern gets the same singleton node.
        let nodeMap = new Map<Pattern, TaxonomyNode>();
        let nodeFor = (pattern: Pattern) => {
            if (!nodeMap.has(pattern)) nodeMap.set(pattern, new TaxonomyNode(pattern));
            return nodeMap.get(pattern);
        }

        // TODO: delegate...
        this.rootNode = makeTaxonomy(patterns, nodeFor);
        this.allNodes = Array.from(nodeMap.values());
    }


    // TODO: doc...
    rootNode: TaxonomyNode;


    // TODO: doc...
    allNodes: TaxonomyNode[];
}





// TODO: doc...
function makeTaxonomy(patterns: Pattern[], nodeFor: (pattern: Pattern) => TaxonomyNode): TaxonomyNode {

    // TODO: ...
    let rootNode = nodeFor(Pattern.UNIVERSAL);

    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    // The rest of the algorithm assumes only normalized patterns, which we obtain here.
    patterns
        .map(pat => pat.normalized)
        .filter(pat => pat !== Pattern.UNIVERSAL && pat !== Pattern.EMPTY)
        .forEach(pat => insertAsDescendent(nodeFor(pat), rootNode, nodeFor));

    // Return a new top-level node with the single key '…'.
    return rootNode;
}
