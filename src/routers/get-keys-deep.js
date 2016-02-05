'use strict';
/** Returns all the keys in `obj` and all it's sub-objects, recursively. Duplicates are removed. */
function getKeysDeep(obj) {
    let keys = getKeysDeepWithDuplicates(obj);
    let map = keys.reduce((map, key) => (map[key] = true, map), {});
    return Object.keys(map);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getKeysDeep;
// TODO: doc...
function getKeysDeepWithDuplicates(obj) {
    return Object.keys(obj).reduce((allKeys, key) => allKeys.concat(key, getKeysDeep(obj[key])), []);
}
//# sourceMappingURL=get-keys-deep.js.map