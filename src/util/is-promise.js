'use strict';
// TODO: this function is not used anywhere. Remove it?
/** Tests whether `value` appears to be an Promises/A+ instance */
function isPromise(value) {
    if (!value)
        return false;
    var type = typeof value;
    if (type !== 'object' && type !== 'function')
        return false;
    return typeof value.then === 'function';
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isPromise;
//# sourceMappingURL=is-promise.js.map