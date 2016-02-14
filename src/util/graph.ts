'use strict';





/**
 * Represents a directed graph with nodes of type T, using a recursive arrangement of ES6 Map
 * objects. All map keys are of type T and represent nodes in the graph. Every value in a map is
 * another map whose keys are nodes and whose values are more maps, and so on. An edge from node A
 * to node B exists iff A is a key in map M1 and B is a key in map M2, and M1.get(A) === M2.
 */
interface Graph<T> extends Map<T, Graph<T>> { }
export default Graph;
