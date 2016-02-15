'use strict';
import {PatternNode} from '../patterns/hierarchize-patterns';
// TODO: this don't belong in util since it calls out to ../patterns





/** Returns all the nodes that comprise the given graph. */
export default function getAllGraphNodes(graph: PatternNode): PatternNode[] {
    let allNodes = new Set<PatternNode>();
    collectAllGraphNodes(graph, allNodes);
    return Array.from(allNodes.values());
}





/** Helper function that recurses over the graph without revisiting already-visited nodes. */
function collectAllGraphNodes(node: PatternNode, allNodes: Set<PatternNode>) {

    // TODO: temp testing... rearranged...
    allNodes.add(node);

    // Get all as-yet-unvisited child nodes of the given node.
    let childNodes = node.children.filter(childNode => !allNodes.has(childNode));

    // Visit each child recursively, adding all unvisited nodes to allNodes.
    childNodes.forEach(childNode => {
        // TODO: was... remove... allNodes.add(childNode);
        collectAllGraphNodes(childNode, allNodes);
    });
}
