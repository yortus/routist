'use strict';
// TODO: doc... add tests...
function getLongestCommonPrefix(arrays) {
    // TODO: stupid case...
    if (arrays.length === 0)
        return [];
    // TODO: explain rest...
    var commonPrefix = [];
    var _loop_1 = function() {
        var el = arrays[0][commonPrefix.length];
        if (arrays.some(function (array) { return array[commonPrefix.length] !== el; }))
            return "break";
        commonPrefix.push(el);
    };
    while (arrays.every(function (array) { return array.length > commonPrefix.length; })) {
        var state_1 = _loop_1();
        if (state_1 === "break") break;
    }
    return commonPrefix;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getLongestCommonPrefix;
//# sourceMappingURL=get-longest-common-prefix.js.map