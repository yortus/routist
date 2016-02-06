'use strict';
import * as assert from 'assert';
import Hierarchy from '../utils/hierarchy';
import intersectPatterns from './intersect-patterns';
import Pattern from './pattern';
// TODO: review jsdocs after pattern overhaul





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
export default function hierarchizePatterns(patterns: Pattern[]): Hierarchy<Pattern> {

    // TODO: we only need to deal with normalised patterns in here. Simpler to map to them now...
    patterns = patterns.map(pat => pat.normalized);

    // Create the nodeFor() function to return nodes from a single associative array
    // of patterns, creating them on demand if they don't exist. This ensures every
    // request for the same pattern gets the same singleton node.
    let map = <Hierarchy<Pattern>> new Map();
    let nodeFor = (pattern: Pattern) => {
        let node = map.get(pattern);
        if (node) return node;
        node = <any> new Map();
        map.set(pattern, node);
        return node;
    }

    // Insert each of the given patterns (except '…' and '∅') into a DAG rooted at '…'.
    patterns
        .filter(p => p !== Pattern.UNIVERSAL && p !== Pattern.EMPTY)
        .forEach(p => insert(p, Pattern.UNIVERSAL, nodeFor));

    // Return a top-level node with the single key '…'.
    return <Hierarchy<Pattern>> new Map().set(Pattern.UNIVERSAL, nodeFor(Pattern.UNIVERSAL));
}





/** Recursive structure used for representing a DAG whose nodes are patterns. */
export type PatternHierarchy = {[patternSource: string]: PatternHierarchy};





/**
 * Inserts `pattern` into the appropriate position in the DAG rooted at `superset`.
 * `pattern` must be a proper subset of `superset`, and must not be '∅'.
 * @param {string} pattern - The new pattern to be inserted into the DAG.
 * @param {string} superset - The root pattern of the subgraph of the DAG, below
 *        which `pattern` is to be inserted.
 * @param {(pattern: string) => PatternHierarchy} nodeFor - A callback used by the
 *        function to map patterns to their corresponding nodes on demand.
 */
function insert(pattern: Pattern, superset: Pattern, nodeFor: (pattern: Pattern) => Hierarchy<Pattern>) {

    // Compute information about all the existing direct subsets of `superset`.
    // We only care about the ones that are non-disjoint with `pattern`.
    let nonDisjointComparands = Array.from(nodeFor(superset).keys())
        .map(p => ({ pattern: p, intersection: intersectPatterns(pattern, p) })) // TODO: review this line
        .filter(cmp => cmp.intersection !== Pattern.EMPTY);

    // If `superset` has no direct subsets that are non-disjoint with `pattern`, then we
    // simply add `pattern` as a direct subset of `superset`.
    if (nonDisjointComparands.length === 0) {
        nodeFor(superset).set(pattern, nodeFor(pattern));
    }

    // If `pattern` already exists as a direct subset of `superset` at this stage
    // (including if it was just added above), then we are done.
    if (nodeFor(superset).has(pattern)) return;

    // `pattern` has subset/superset/overlapping relationships with one or more of
    // `superset`'s existing direct subsets. Work out how and where to insert it.
    nonDisjointComparands.forEach(comparand => {
        let isSubsetOfComparand = comparand.intersection === pattern;
        let isSupersetOfComparand = comparand.intersection === comparand.pattern;
        let isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;

        if (isSupersetOfComparand) {
            // Remove the comparand from `superset`. It will be re-inserted as a subset of `pattern` below.
            nodeFor(superset).delete(comparand.pattern);
        }

        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `pattern` as a direct subset of `superset`.
            nodeFor(superset).set(pattern, nodeFor(pattern));

            // Recursively re-insert the comparand (or insert the overlap) as a subset of `pattern`.
            insert(comparand.intersection, pattern, nodeFor);
        }

        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `pattern` (or insert the overlap) as a subset of the comparand.
            insert(comparand.intersection, comparand.pattern, nodeFor);
        }
    });
}
