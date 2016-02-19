'use strict';
var pattern_1 = require('../pattern');
// TODO: review all docs/comments/names
/**
 * Inserts `pattern` into the appropriate position in the DAG rooted at `superset`.
 * `pattern` must be a proper subset of `superset`, and must not be '∅'.
 * @param {Pattern} insertee - the new pattern to be inserted into the DAG.
 * @param {Pattern} ancestor - the root pattern of the subgraph of the DAG in which
 *        `insertee` belongs.
 * @param {(pattern: Pattern) => Graph<Pattern>} nodeFor - a callback used by the
 *        function to map patterns to their corresponding graph nodes on demand.
 */
function insertAsDescendent(insertee, ancestor, nodeFor) {
    // TODO: clarify this comment...
    // Compute information about all the existing child patterns of the `ancestor` pattern.
    // NB: we only care about the ones that are non-disjoint with `insertee`.
    var nonDisjointComparands = ancestor.specializations.reduce(function (comparands, node) {
        var intersection = insertee.pattern.intersect(node.pattern);
        if (intersection !== pattern_1.default.EMPTY)
            comparands.push({ node: node, intersection: nodeFor(intersection) });
        return comparands;
    }, []);
    // If the `ancestor` pattern has no existing child patterns that are non-disjoint
    // with `insertee`, then we simply add `insertee` as a direct child of `ancestor`.
    if (nonDisjointComparands.length === 0) {
        insertChild(ancestor, insertee);
    }
    // If `insertee` already exists as a direct subset of `ancestor` at this point
    // (including if it was just added above), then we are done.
    if (hasChild(ancestor, insertee))
        return;
    // `insertee` has subset/superset/overlapping relationships with one or more of
    // `ancestor`'s existing child patterns. Work out how and where to insert it.
    nonDisjointComparands.forEach(function (comparand) {
        var isSubsetOfComparand = comparand.intersection === insertee;
        var isSupersetOfComparand = comparand.intersection === comparand.node;
        var isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;
        if (isSupersetOfComparand) {
            // Remove the comparand from `ancestor`. It will be re-inserted as a subset of `insertee` below.
            removeChild(ancestor, comparand.node);
        }
        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `insertee` as a direct child of `ancestor`.
            insertChild(ancestor, insertee);
            // Recursively re-insert the comparand (or insert the overlap) as a subset of `insertee`.
            insertAsDescendent(comparand.intersection, insertee, nodeFor);
        }
        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `insertee` (or insert the overlap) as a subset of the comparand.
            insertAsDescendent(comparand.intersection, comparand.node, nodeFor);
        }
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = insertAsDescendent;
// TODO: doc...
function hasChild(node, child) {
    return node.specializations.indexOf(child) !== -1;
}
// TODO: doc...
function insertChild(node, child) {
    // NB: If the child is already there, make this a no-op.
    if (hasChild(node, child))
        return;
    node.specializations.push(child);
    child.generalizations.push(node);
}
// TODO: doc...
function removeChild(node, child) {
    node.specializations.splice(node.specializations.indexOf(child), 1);
    child.generalizations.splice(child.generalizations.indexOf(node), 1);
}
//# sourceMappingURL=insert-as-descendent.js.map