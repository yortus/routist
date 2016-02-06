'use strict';
/**
 * Returns all the keys in `obj` and all it's sub-objects, recursively. Duplicates are removed.
 * For example, if `obj` is { a: { a1: {}, a2: {}, b: 0 }, b: {}, c: { c1: [] }}, the result
 * is ['a', 'a1', 'a2', 'b', 'c', 'c1'].
 */
function getKeysDeep(obj) {
    var keys = getKeysDeepWithDuplicates(obj);
    var map = keys.reduce(function (map, key) { return (map[key] = true, map); }, {});
    return Object.keys(map);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getKeysDeep;
// TODO: doc...
function getKeysDeepWithDuplicates(obj) {
    return Object.keys(obj).reduce(function (allKeys, key) { return allKeys.concat(key, getKeysDeep(obj[key])); }, []);
}
//# sourceMappingURL=get-keys-deep.js.map