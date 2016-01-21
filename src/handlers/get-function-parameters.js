'use strict';
/**
 * Returns an array of the `func` function's formal parameter names.
 * Works with:
 * - ordinary functions
 * - arrow functions.
 * - generator functions.
 * - async functions.
 * - async arrow functions.
 * - parameters with default values (NB: unsupported in all Node versions).
 * - comments and line breaks in parameter list.
 * DOES NOT WORK with:
 * - rest parameters.
 * - destructured parameters.
 * Adapted from http://stackoverflow.com/a/31194949/1075886.
 */
function getFunctionParameters(func) {
    // strip all whitespace and comments.
    let result = func.toString();
    result = result.replace(/\s+/g, '');
    result = result.replace(/[/][*][^/*]*[*][/]/g, '');
    // Detect special case 'foo=>...' (no parentheses around parameter).
    let id = result.split('=>')[0];
    if (/^[a-z0-9$_]+$/i.test(id))
        return id;
    // Extract the parameter names.
    result = result.split(/\)(?:\{|(?:\=\>))/, 1)[0].replace(/^[^(]*[(]/, '');
    // Strip any ES6 defaults.
    result = result.replace(/=[^,]+/g, '');
    // Convert to array, filter out blanks, and return result.
    result = result.split(',').filter(Boolean);
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getFunctionParameters;
//# sourceMappingURL=get-function-parameters.js.map