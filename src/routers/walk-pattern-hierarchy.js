'use strict';
/**
 * Enumerates each walk through the nodes of the `patternHierarchy` DAG that begins at the
 * root node. The provided `callback` function is called once for each such walk. The walk
 * is passed as the first argument to `callback`. It is represented as an array, the elements
 * of which are the pattern signatures of each node in the walk, ordered from the root to the
 * descendent.
 * NB: The term 'walk' is used in the graph theory sense. See:
 * https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 * @param {PatternHierarchy} patternHierarchy - the pattern DAG to be walked.
 * @param {(path: string[]) => any} callback - the function to be called for each walk.
 * @returns an array of the return values from each `callback` call.
 */
function walkPatternHierarchy(patternHierarchy, callback) {
    var walks = getAllWalksStartingFrom('…', patternHierarchy['…']);
    return walks.map(callback);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = walkPatternHierarchy;
/**
 * Returns a list of all the walks that start at `node` and end at any reachable descendent
 * via `children`. The degenerate walk consisting of just `node` is included in the result.
 * The returned value is an array of paths, which are themselves arrays of signature strings.
 */
function getAllWalksStartingFrom(node, children) {
    // Always include the degenerate walk of just [node] in the result.
    var result = [[node]];
    // Recursively get all possible trails starting from each child node.
    var childTrailLists = Object.keys(children).map(function (childRoot) { return getAllWalksStartingFrom(childRoot, children[childRoot]); });
    // Flatten the list-of-lists produced by the previous map operation.
    var childTrails = [].concat.apply([], childTrailLists);
    // Prepend `node` to each child trail and add them to the result.
    childTrails.forEach(function (trail) {
        trail.unshift(node);
        result.push(trail);
    });
    // All done.
    return result;
}
//# sourceMappingURL=walk-pattern-hierarchy.js.map