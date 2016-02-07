'use strict';
import Graph from './graph';





/** Returns all the nodes that comprise the given graph. */
export default function getAllGraphNodes<T>(graph: Graph<T>): T[] {
    let allNodes = new Set<T>();
    collectAllGraphNodes(graph, allNodes);
    return Array.from(allNodes.values());
}





/** Helper function that recurses over the graph without revisiting already-visited nodes. */
function collectAllGraphNodes<T>(node: Graph<T>, allNodes: Set<T>) {

    // Get all as-yet-unvisited child nodes of the given node.
    let childNodes = Array.from(node.keys()).filter(childNode => !allNodes.has(childNode));

    // Visit each child recursively, adding all unvisited nodes to allNodes.
    childNodes.forEach(childNode => {
        allNodes.add(childNode);
        collectAllGraphNodes(node.get(childNode), allNodes);
    });
}
