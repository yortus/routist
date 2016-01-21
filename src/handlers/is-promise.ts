'use strict';





/** Tests whether `value` appears to be an A+ Promise instance */
export default function isPromise(value): value is Promise<any> {
    if (!value) return false;
    let type = typeof value;
    if (type !== 'object' && type !== 'function') return false;
    return typeof value.then === 'function';
}
