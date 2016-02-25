'use strict';
import * as assert from 'assert';
import {getFunctionParameterNames} from '../util';
import Pattern from '../pattern';
// TODO: review all jsdocs below after reshuffle between files...





// TODO: doc...
export default class Rule {


    // TODO: doc...
    constructor(rawPattern: string, rawHandler: Function) {

        // TODO: ...
        let pattern = this.pattern = new Pattern(rawPattern); // NB: may throw...
        let paramNames = this.parameterNames = getFunctionParameterNames(rawHandler);

        // Assert the mutual validity of `pattern` and `paramNames`. This allows the body of
        // the 'execute' function to be simpler, as it can safely forego some extra checks.
        validateNames(pattern, paramNames); // NB: may throw...

        // TODO: ...
        // If the handler function has a formal parameter named '$next', that signifies this rule as a decorator.
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





// TODO: for review... comments originally from normalize-handler.ts...





// /**
//  * A handler provides a standarized means for transforming a request to a response,
//  * according to the particulars of the pattern/action pair it was constructed with.
//  */





/**
 * Constructs a Rule instance.
 * @param {string} patternSource - the pattern recognized by this handler.
 * @param {Function} handler - a function providing processing logic for producing
 *        a reponse from a given request. The `action` function may be invoked when
 *        the `Handler#execute` method is called. Each of the `action` function's
 *        formal parameter names must match either a capture name from `pattern`, or
 *        a builtin name such as `$req` or `$yield`. Capture values and/or builtin
 *        values are passed to the matching parameters of `action` upon invocation.
 *        A non-null return value from `action` is interpreted as a response. A null
 *        return value from `action` signifies that the action declined to respond to
 *        the given request, even if the pattern matched the request's address.
 */





/**
 * Executes the rule. There are two modes of execution depending on whether or not
 * the rule is a decorator:
 * (1) A decorator has control over downstream execution. Its handler's $next' parameter
 * is bound to the `executeDownstreamHandlers` callback passed to `execute`. A decorator
 * may perform arbitrary steps before downstream execution, including modifying the
 * request. It may also perform arbitrary steps after downstream execution, including
 * modifying the response.
 * (2) A non-decorator rule always perform downstream execution first, and then only
 * executes its handler if the downsteam handlers did not produce a response.
 * @param {Request} request - an object containing all information relevant to producing
 *        a response, including the address from which capture name/value pairs are bound
 *        to handler function parameters.
 * @param {(request?: Request) => Response} executeDownstreamHandlers - a callback that
 *        executes all downsteam handlers and returns their collective response. The
 *        callback is already bound to the current request, and passes it to downstream
 *        handlers if invoked with no argument. A modified or alternative request may be
 *        passed to downstream handlers by passing it to this callback.
 * @returns {Response} - the response object returned by the handler. The handler may
 *        return null to indicate that it declined to produce a response. Processing
 *        proceeds upstream until a handler responds are all decorators have run.
 */
