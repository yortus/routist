'use strict';
import * as assert from 'assert';
import {getFunctionParameterNames} from '../util';
import Pattern from '../pattern';
// TODO: review all jsdocs below after reshuffle between files...





// TODO: doc...
export default class Rule {


    // TODO: doc...
    constructor(rawPattern: string, rawHandler: Function) {
        let pattern = this.pattern = new Pattern(rawPattern); // NB: may throw...
        let paramNames = this.parameterNames = getFunctionParameterNames(rawHandler);
        validateNames(pattern, paramNames); // NB: may throw...
        this.handler = rawHandler;
        this.isDecorator = paramNames.indexOf('$next') !== -1;
    }


    // TODO: doc...
    pattern: Pattern;


    // TODO: doc...
    handler: Function;


    // TODO: doc...
    parameterNames: string[];


    // TODO: doc...
    isDecorator: boolean;
}





/**
 * Lists the names of builtins with special meanings when they
 * are used as formal parameter names in handler functions.
 * '$req': injects the current request into the action function.
 * '$yield': marks the action function as a decorator. Injects the
 *           standard `executeDownstreamHandlers` callback into it.
 */
const builtinNames = ['$addr', '$req', '$next']; // TODO: temp testing remove $addr!





/**
 * Asserts the mutual validity of a pattern's capture names with an action's parameter names:
 * - Every parameter name must match either a capture name or a builtin name.
 * - Every capture name in the pattern must also be present among the action's parameter names.
 * - None of the pattern's capture names may match a builtin name.
 */
function validateNames(pattern: Pattern, paramNames: string[]) {
    let bnames = builtinNames;
    let pnames = paramNames;
    let cnames = pattern.captureNames;

    // We already know the capture names are valid JS identifiers. Now also ensure they don't clash with builtin names.
    let badCaptures = cnames.filter(cname => bnames.indexOf(cname) !== -1);
    let ok = badCaptures.length === 0;
    assert(ok, `Use of reserved name(s) '${badCaptures.join("', '")}' as capture(s) in pattern '${Pattern}'`);

    // Ensure that all capture names appear among the handler's parameter names (i.e. check for unused capture names).
    let excessCaptures = cnames.filter(cname => pnames.indexOf(cname) === -1);
    ok = excessCaptures.length === 0;
    assert(ok, `Capture name(s) '${excessCaptures.join("', '")}' unused by handler in pattern '${pattern}'`);

    // Ensure every parameter name matches either a capture name or a builtin name (i.e. check for unsatisfied params).
    let excessParams = pnames.filter(pname => bnames.indexOf(pname) === -1 && cnames.indexOf(pname) === -1);
    ok = excessParams.length === 0;
    assert(ok, `Handler parameter(s) '${excessParams.join("', '")}' not captured by pattern '${pattern}'`);
}
