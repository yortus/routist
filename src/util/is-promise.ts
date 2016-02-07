'use strict';
// TODO: this function is not used anywhere. Remove it?





/** Tests whether `value` appears to be an Promises/A+ instance */
export default function isPromise(value): value is Promise<any> {
    if (!value) return false;
    let type = typeof value;
    if (type !== 'object' && type !== 'function') return false;
    return typeof value.then === 'function';
}
