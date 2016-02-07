'use strict';
// TODO: review docs... Doesn't work with objs anymore, only maps, actually only Hierarchy<T>
/**
 * Returns all the keys in `obj` and all it's sub-objects, recursively. Duplicates are removed.
 * For example, if `obj` is { a: { a1: {}, a2: {}, b: 0 }, b: {}, c: { c1: [] }}, the result
 * is ['a', 'a1', 'a2', 'b', 'c', 'c1'].
 */
function getGraphNodes(map) {
    var keys = getKeysDeepWithDuplicates(map);
    var map2 = keys.reduce(function (map2, key) { return map2.set(key, true); }, new Map());
    return Array.from(map2.keys());
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getGraphNodes;
// TODO: doc...
function getKeysDeepWithDuplicates(map) {
    return Array.from(map.keys()).reduce(function (allKeys, key) { return allKeys.concat(key, getKeysDeepWithDuplicates(map.get(key))); }, []);
}
//# sourceMappingURL=get-graph-nodes.js.map