'use strict';
// TODO: this don't belong in util since it calls out to ../patterns
/** Returns all the nodes that comprise the given graph. */
function getAllGraphNodes(graph) {
    var allNodes = new Set();
    collectAllGraphNodes(graph, allNodes);
    return Array.from(allNodes.values());
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getAllGraphNodes;
/** Helper function that recurses over the graph without revisiting already-visited nodes. */
function collectAllGraphNodes(node, allNodes) {
    // TODO: temp testing... rearranged...
    allNodes.add(node);
    // Get all as-yet-unvisited child nodes of the given node.
    var childNodes = node.children.filter(function (childNode) { return !allNodes.has(childNode); });
    // Visit each child recursively, adding all unvisited nodes to allNodes.
    childNodes.forEach(function (childNode) {
        // TODO: was... remove... allNodes.add(childNode);
        collectAllGraphNodes(childNode, allNodes);
    });
}
//# sourceMappingURL=get-all-graph-nodes.js.map