'use strict';
// TODO: re-implement getFunctionParameters using a pegjs grammar, including defaults & destructuring...





/**
 * Returns an array of the `func` function's formal parameter names.
 * Works with:
 * - ordinary functions
 * - arrow functions.
 * - generator functions.
 * - async functions.
 * - async arrow functions.
 * - rest parameters.
 * - comments and line breaks in parameter list.
 * DOES NOT WORK with:
 * - parameters with default values.
 * - destructured parameters.
 * Adapted from http://stackoverflow.com/a/31194949/1075886.
 */
export default function getFunctionParameters(func: Function): string[] {

    // strip all whitespace and comments.
    let result: any = func.toString();
    result = result.replace(/\s+/g, '');
    result = result.replace(/[/][*][^/*]*[*][/]/g, '');

    // Detect special case 'foo=>...' (no parentheses around parameter).
    let id = result.split('=>')[0];
    if (/^[a-z0-9$_]+$/i.test(id)) return id;

    // Extract the parameter names.
    result = result.split(/\)(?:\{|(?:\=\>))/,1)[0].replace(/^[^(]*[(]/, '');

    // Strip ES6 rest parameter.
    result = result.replace(/\.\.\..*/g, '');

    // Detect unsupported ES6 features and fail if found (ie default params, destructuring).
    if (result.replace(/[^=\[{]*/g, '').length > 0) {
        throw new Error(`getFunctionParameters: unsupported function syntax in ${func}`);
    }

    // Convert to array, filter out blanks, and return result.
    result = result.split(',').filter(Boolean);
    return result;
}
