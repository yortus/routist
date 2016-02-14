'use strict';
import * as assert from 'assert';
import Graph from './graph';
// TODO: review all docs below after re-introducing this function and converting it for Graph<T>...





/**
 * Traverses the object graph rooted at `graph`, creating a new object graph with equivalent
 * topology. The nodes in the input graph are comprised of the input object's key/value pairs,
 * including those found by recursively traversing over values that are objects themselves. Each
 * key/value pair is considered to have an incoming edge from its containing object. `graph` may be
 * be tree-shaped, or it may contain cycles and/or 'diamonds' (ie multiple nodes sharing a child).
 * Each node is visited just once, and the `addNode` callback is called to create the corresponding
 * output node in a client-defined manner. Each edge is visited just once, and the `addEdge`
 * callback is called to connect the parent and child output nodes in a client-defined manner.
 * @param {Object} graph - the input graph to be traversed. It may be a tree, DAG, or cyclic graph.
 * @param {<U>(value, key) => U} addNode - callback that is called once for each node in the input
 *        graph. It is passed the input node as a key/value pair, and is expected to return an
 *        output node mapped from the inputs.
 * @param {<U>(parent: U, child: U) => void} addEdge - callback that is called once for each pair
 *        of output nodes whose equivalent input nodes are joined by an edge.
 * @returns the root node of the output graph.
 */
export default function mapGraph<T, U>(graph: Graph<T>, addNode: AddNode<T,U>, addEdge: AddEdge<U>): U {
    let newRoot = new Map<any, any>().set(null, graph);
    return mapGraphNode(newRoot, null, addNode, addEdge, new Map<any, any>());
}





// These types are for convenience, mainly to shorten the function declaration lines.
type AddNode<T, U> = (value: T) => U;
type AddEdge<U> = (parent: U, child: U) => void





/**
 * Implements the logic of mapGraph using recursion. The function signature has an
 * additional `visited` parameter, which enables support for DAGs and cyclic graphs.
 */
function mapGraphNode<T, U>(graph: Graph<T>, inputNode: T, addNode: AddNode<T,U>, addEdge: AddEdge<U>, visited: Map<T, [Graph<T>, U]>): U {

    // If we've already visited this input node, return its already-constructed output node.
    let cycle = visited.get(inputNode);
    if (cycle) {
        if (graph.get(inputNode) !== cycle[0]) {
            let _0 = graph.get(inputNode);
            let _1 = cycle[0];
            debugger;
        }
        //assert(graph.get(inputNode) === cycle[0]); // TODO: sanity check! Ensure if we come across the same key again, if maps to the same node again.
        return cycle[1];
    }

    // Construct the output node for this input node by calling `addNode`. Add the result to the `visited` map.
    let outputNode = addNode(inputNode);
    let children = graph.get(inputNode);
    visited.set(inputNode, [children, outputNode]);

    // Recurse over the input node's child nodes.
    Array.from(children.entries()).forEach(([childNode, grandChildren]) => {

        // Get the output node corresponding to this child input node. This step is recursive. If the child input
        // node has already been visited (which may hapen in a DAG or cyclic graph), this will return the already-
        // constructed output node for the child input node. Otherwise, we proceed by recursion here.
        let childOutputNode = mapGraphNode(children, childNode, addNode, addEdge, visited);

        // Add the edge between the current and child output nodes by calling `addEdge`.
        addEdge(outputNode, childOutputNode);
    });
    return outputNode;
}
