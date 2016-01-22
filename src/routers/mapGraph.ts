'use strict';
import * as assert from 'assert';





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
export default function mapGraph<T extends {[key: string]: T}, U>(graph: T, addNode: AddNode<T,U>, addEdge: AddEdge<U>): U {
    return mapGraphImpl(graph, null, addNode, addEdge, new Map());
}




// These types are for convenience, mainly to shorten the function declaration lines.
type Graph<T> = {[key: string]: T};
type AddNode<T, U> = (value: T, key: string) => U;
type AddEdge<U> = (parent: U, child: U) => void





/**
 * Implements the logic of mapGraph using recursion. The function signature has an
 * additional `visited` parameter, which enables support for DAGs and cyclic graphs.
 */
function mapGraphImpl<T extends {[key: string]: T}, U>(inputValue: T, inputKey: string, addNode: AddNode<T,U>, addEdge: AddEdge<U>, visited: Map<T, U>): U {

    // If we've already visited this input node, return its already-constructed output node.
    let outputNode = visited.get(inputValue);
    if (outputNode) return outputNode;

    // Construct the output node for this input node by calling `addNode`. Add the result to the `visited` map.
    outputNode = addNode(inputValue, inputKey);
    visited.set(inputValue, outputNode);

    // Ensure the input node's value is an object.
    // TODO: explain why, or relax this. Are there cases where we should wish to do otherwise?
    assert(!!inputValue && typeof inputValue === 'object');

    // Recurse over the input node's own key/value pairs. These are the child nodes of the current input node.
    Object.keys(inputValue).forEach(childInputKey => {
        let childInputValue = inputValue[childInputKey];

        // Get the output node corresponding to this child input node. This step is recursive. If the child input
        // node has already been visited (which may hapen in a DAG or cyclic graph), this will return the already-
        // constructed output node for the child input node. Otherwise, we proceed by recursion here.
        let childOutputNode = mapGraphImpl(childInputValue, childInputKey, addNode, addEdge, visited);

        // Add the edge between the current and child output nodes by calling `addEdge`.
        addEdge(outputNode, childOutputNode);
    });
    return outputNode;
}
