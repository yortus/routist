'use strict';





/** Returns all the keys in `obj` and all it's sub-objects, recursively. Duplicates are removed. */
export default function getKeysDeep(obj) {
    let keys = getKeysDeepWithDuplicates(obj);
    let map = keys.reduce((map, key) => (map[key] = true, map), {});
    return Object.keys(map);
}





// TODO: doc...
function getKeysDeepWithDuplicates(obj): string[] {
    return Object.keys(obj).reduce((allKeys, key) => allKeys.concat(key, getKeysDeep(obj[key])), []);
}
