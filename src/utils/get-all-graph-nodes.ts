'use strict';
import Graph from './graph';
// TODO: review docs... Doesn't work with objs anymore, only maps, actually only Hierarchy<T>





/**
 * Returns all the keys in `obj` and all it's sub-objects, recursively. Duplicates are removed.
 * For example, if `obj` is { a: { a1: {}, a2: {}, b: 0 }, b: {}, c: { c1: [] }}, the result
 * is ['a', 'a1', 'a2', 'b', 'c', 'c1'].
 */
export default function getAllGraphNodes<T>(map: Graph<T>): T[] {
    let keys = getKeysDeepWithDuplicates(map);
    let map2 = keys.reduce((map2, key) => map2.set(key, true), new Map<T, any>());
    return Array.from(map2.keys());
}





// TODO: doc...
function getKeysDeepWithDuplicates<T>(map: Graph<T>): T[] {
    return Array.from(map.keys()).reduce((allKeys, key) => allKeys.concat(key, getKeysDeepWithDuplicates(map.get(key))), []);
}
