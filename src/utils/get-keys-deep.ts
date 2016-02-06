'use strict';





/**
 * Returns all the keys in `obj` and all it's sub-objects, recursively. Duplicates are removed.
 * For example, if `obj` is { a: { a1: {}, a2: {}, b: 0 }, b: {}, c: { c1: [] }}, the result
 * is ['a', 'a1', 'a2', 'b', 'c', 'c1'].
 */
export default function getKeysDeep(obj) {
    let keys = getKeysDeepWithDuplicates(obj);
    let map = keys.reduce((map, key) => (map[key] = true, map), {});
    return Object.keys(map);
}





// TODO: doc...
function getKeysDeepWithDuplicates(obj): string[] {
    return Object.keys(obj).reduce((allKeys, key) => allKeys.concat(key, getKeysDeep(obj[key])), []);
}
