'use strict';
// TODO: review all docs below after data structure changes
/** Returns all the nodes that comprise the given graph. */
function getAllPatternsInTaxonomy(taxonomy) {
    var allNodes = new Set();
    collectAllNodes(taxonomy, allNodes);
    return Array.from(allNodes.values()).map(function (node) { return node.pattern; });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getAllPatternsInTaxonomy;
/** Helper function that recurses over the graph without revisiting already-visited nodes. */
function collectAllNodes(node, allNodes) {
    // TODO: temp testing... rearranged...
    allNodes.add(node);
    // Get all as-yet-unvisited child nodes of the given node.
    var childNodes = node.specializations.filter(function (childNode) { return !allNodes.has(childNode); });
    // Visit each child recursively, adding all unvisited nodes to allNodes.
    childNodes.forEach(function (childNode) {
        // TODO: was... remove... allNodes.add(childNode);
        collectAllNodes(childNode, allNodes);
    });
}
//# sourceMappingURL=get-all-patterns-in-taxonomy.js.map