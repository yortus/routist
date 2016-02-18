'use strict';
import Pattern from '../pattern';
import Taxonomy from './taxonomy';
// TODO: review all docs below after data structure changes
// TODO: review all docs in here... function signatures were changed (callback removed)





/**
 * Enumerates every possible walk[1] in the `taxonomy` DAG that begins at the root Pattern
 * and ends at any Pattern reachable from the root. The provided `callback` function is called once
 * for each such walk. The walk is passed as the first argument to `callback`, in the form of a
 * Pattern array, whose elements are arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 * @param {Taxonomy} taxonomy - the pattern DAG to be walked.
 * TODO: fix below....
 * @param {(path: Pattern[]) => T} callback - the function to be called once for each walk.
 * @returns an array of the return values from each invocation of `callback`.
 */
export default function walkTaxonomy(taxonomy: Taxonomy): Pattern[][] {
    return getAllWalksStartingFrom(taxonomy);
}





/**
 * Returns a list of all the walks that start at `node` and end at any reachable descendent
 * via `children`. The degenerate walk, consisting of just `node`, is included in the result.
 * The returned value is an array of paths, which are themselves arrays of Patterns.
 */
function getAllWalksStartingFrom(node: Taxonomy): Pattern[][] {

    // Recursively get all possible walks starting from each child node.
    let childPatterns = node.specializations;
    let childWalkLists = childPatterns.map(childPat => getAllWalksStartingFrom(childPat));

    // Flatten the list-of-lists produced by the previous map operation, also prepending an empty walk.
    let childWalks: Pattern[][] = [].concat([[]], ...childWalkLists);

    // Return all the discovered walks, with `node` prepended to each one.
    return childWalks.map(childwalk => [node.pattern].concat(childwalk));
}