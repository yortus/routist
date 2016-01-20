'use strict';





/**
 * Returns an array of the `func` function's formal parameter names.
 * Works for both ordinary and arrow functions. Works for parameters
 * with default values. DOES NOT WORK for destructured parameters.
 * Adapted from http://stackoverflow.com/a/31194949/1075886.
 */
export default function getFunctionParameters(func: Function): string[] {
    // TODO: support destructuring in parameter list?
    let result = func.toString()
        .replace(/\s+/g, '') // strip all whitespace
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip simple comments
        .split(/\)(?:\{|(?:\=\>))/,1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
    return result;
}
