'use strict';
import * as assert from 'assert'; // TODO: remove...





// TODO: doc... add tests...
export default function getLongestCommonPrefix<T>(arrays: T[][]): T[] {
    assert(arrays.length > 0); // TODO: doc as precond...
    let commonPrefix: T[] = [];
    while (arrays.every(array => array.length > commonPrefix.length)) {
        let el = arrays[0][commonPrefix.length];
        if (arrays.some(array => array[commonPrefix.length] !== el)) break;
        commonPrefix.push(el);
    }
    return commonPrefix;
}
