'use strict';
// TODO: review all docs in here... function signatures were changed (callback removed)
/**
 * Enumerates every possible walk[1] in the `patternHierarchy` DAG that begins at the root Pattern
 * and ends at any Pattern reachable from the root. The provided `callback` function is called once
 * for each such walk. The walk is passed as the first argument to `callback`, in the form of a
 * Pattern array, whose elements are arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 * @param {Graph<Pattern>} patternHierarchy - the pattern DAG to be walked.
 * @param {(path: Pattern[]) => T} callback - the function to be called once for each walk.
 * @returns an array of the return values from each invocation of `callback`.
 */
function walkPatternHierarchy(patternHierarchy) {
    return getAllWalksStartingFrom(patternHierarchy);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = walkPatternHierarchy;
/**
 * Returns a list of all the walks that start at `node` and end at any reachable descendent
 * via `children`. The degenerate walk, consisting of just `node`, is included in the result.
 * The returned value is an array of paths, which are themselves arrays of Patterns.
 */
function getAllWalksStartingFrom(node) {
    // Recursively get all possible walks starting from each child node.
    var childPatterns = node.children;
    var childWalkLists = childPatterns.map(function (childPat) { return getAllWalksStartingFrom(childPat); });
    // Flatten the list-of-lists produced by the previous map operation, also prepending an empty walk.
    var childWalks = (_a = []).concat.apply(_a, [[[]]].concat(childWalkLists));
    // Return all the discovered walks, with `node` prepended to each one.
    return childWalks.map(function (childwalk) { return [node.pattern].concat(childwalk); });
    var _a;
}
//# sourceMappingURL=walk-pattern-hierarchy.js.map