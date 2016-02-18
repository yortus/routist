'use strict';
import * as assert from 'assert';
import Pattern from '../pattern';
import Taxonomy from './taxonomy'; // NB: circular ref is elided from output (only used for type info)
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
export default function insertAsDescendent(insertee: Pattern, ancestor: Pattern, nodeFor: (pattern: Pattern) => Taxonomy) {

    // Compute information about all the existing child patterns of the `ancestor` pattern.
    // NB: we only care about the ones that are non-disjoint with `insertee`.
    let nonDisjointComparands = nodeFor(ancestor).specializations
        .map(node => node.pattern)
        .map(pattern => ({ pattern, intersection: insertee.intersect(pattern) }))
        .filter(cmp => cmp.intersection !== Pattern.EMPTY);

    // If the `ancestor` pattern has no existing child patterns that are non-disjoint
    // with `insertee`, then we simply add `insertee` as a direct child of `ancestor`.
    if (nonDisjointComparands.length === 0) {
        insertChild(nodeFor(ancestor), nodeFor(insertee));
    }

    // If `insertee` already exists as a direct subset of `ancestor` at this point
    // (including if it was just added above), then we are done.
    if (hasChild(nodeFor(ancestor), nodeFor(insertee))) return;

    // `insertee` has subset/superset/overlapping relationships with one or more of
    // `ancestor`'s existing child patterns. Work out how and where to insert it.
    nonDisjointComparands.forEach(comparand => {
        let isSubsetOfComparand = comparand.intersection === insertee;
        let isSupersetOfComparand = comparand.intersection === comparand.pattern;
        let isOverlappingComparand = !isSubsetOfComparand && !isSupersetOfComparand;

        if (isSupersetOfComparand) {
            // Remove the comparand from `ancestor`. It will be re-inserted as a subset of `insertee` below.
            removeChild(nodeFor(ancestor), nodeFor(comparand.pattern));
        }

        if (isSupersetOfComparand || isOverlappingComparand) {
            // Add `insertee` as a direct child of `ancestor`.
            insertChild(nodeFor(ancestor), nodeFor(insertee));

            // Recursively re-insert the comparand (or insert the overlap) as a subset of `insertee`.
            insertAsDescendent(comparand.intersection, insertee, nodeFor);
        }

        if (isSubsetOfComparand || isOverlappingComparand) {
            // Recursively insert `insertee` (or insert the overlap) as a subset of the comparand.
            insertAsDescendent(comparand.intersection, comparand.pattern, nodeFor);
        }
    });
}





// TODO: doc...
function hasChild(parent: Taxonomy, child: Taxonomy): boolean {
    return parent.specializations.indexOf(child) !== -1;
}





// TODO: doc...
function insertChild(parent: Taxonomy, child: Taxonomy) {
    // NB: If the child is already there, make this a no-op.
    if (hasChild(parent, child)) return;
    parent.specializations.push(child);
    child.generalizations.push(parent);
}





// TODO: doc...
function removeChild(parent: Taxonomy, child: Taxonomy) {
    assert(hasChild(parent, child));
    parent.specializations.splice(parent.specializations.indexOf(child), 1);
    child.generalizations.splice(child.generalizations.indexOf(parent), 1);
}
