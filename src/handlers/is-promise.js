'use strict';
/** Tests whether `value` appears to be an A+ Promise instance */
function isPromise(value) {
    if (!value)
        return false;
    let type = typeof value;
    if (type !== 'object' && type !== 'function')
        return false;
    return typeof value.then === 'function';
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isPromise;
//# sourceMappingURL=is-promise.js.map