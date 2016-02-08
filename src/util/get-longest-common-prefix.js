'use strict';
var assert = require('assert'); // TODO: remove...
// TODO: doc... add tests...
function getLongestCommonPrefix(arrays) {
    assert(arrays.length > 0); // TODO: doc as precond...
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