'use strict';
import Pattern from '../pattern';
import {Taxonomy} from './make-taxonomy';
// TODO: review all docs below after data structure changes





/** Returns all the nodes that comprise the given graph. */
export default function getAllPatternsInTaxonomy(taxonomy: Taxonomy): Pattern[] {
    let allNodes = new Set<Taxonomy>();
    collectAllNodes(taxonomy, allNodes);
    return Array.from(allNodes.values()).map(node => node.pattern);
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
