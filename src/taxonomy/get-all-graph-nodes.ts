'use strict';
import {Taxonomy} from './make-taxonomy';
// TODO: rename this - it's Taxonomy-specific





/** Returns all the nodes that comprise the given graph. */
export default function getAllPatternsInTaxonomy(taxonomy: Taxonomy): Taxonomy[] {
    let allNodes = new Set<Taxonomy>();
    collectAllNodes(taxonomy, allNodes);
    return Array.from(allNodes.values());
}





/** Helper function that recurses over the graph without revisiting already-visited nodes. */
function collectAllNodes(node: Taxonomy, allNodes: Set<Taxonomy>) {

    // TODO: temp testing... rearranged...
    allNodes.add(node);

    // Get all as-yet-unvisited child nodes of the given node.
    let childNodes = node.children.filter(childNode => !allNodes.has(childNode));

    // Visit each child recursively, adding all unvisited nodes to allNodes.
    childNodes.forEach(childNode => {
        // TODO: was... remove... allNodes.add(childNode);
        collectAllNodes(childNode, allNodes);
    });
}
