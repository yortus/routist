'use strict';
import * as assert from 'assert';
import getFunctionParameterNames from '../utils/get-function-parameter-names';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// TODO: make async...
// TODO: review all comments given recent changes (Handler/Rule, $yield/$next, executeDownstreamHandlers/downstream)





/**
 * A handler provides a standarized means for transforming a request to a response,
 * according to the particulars of the pattern/action pair it was constructed with.
 */
export default class Rule {


    /**
     * Constructs a Rule instance.
     * @param {Pattern} pattern - the pattern recognized by this handler.
     * @param {Function} action - a function providing processing logic for producing
     *        a reponse from a given request. The `action` function may be invoked when
     *        the `Handler#execute` method is called. Each of the `action` function's
     *        formal parameter names must match either a capture name from `pattern`, or
     *        a builtin name such as `$req` or `$yield`. Capture values and/or builtin
     *        values are passed to the matching parameters of `action` upon invocation.
     *        A non-null return value from `action` is interpreted as a response. A null
     *        return value from `action` signifies that the action declined to respond to
     *        the given request, even if the pattern matched the request's address.
     */
    constructor(public pattern: Pattern, private handler: Function) {
        let paramNames = getFunctionParameterNames(handler);
        this.isDecorator = paramNames.indexOf('$next') !== -1;
        this.execute = <any> makeExecuteFunction(pattern, handler, paramNames);

        // TODO: temp testing... extract rule's 'priority' from comment in pattern...
        // NB: default is 0.
        // NB: error handling??? throw error if not numeric?
        this.comment = pattern.toString().split('#')[1] || '';
    }


    /**
     * Indicates whether or not this handler is a decorator. A handler is a decorator
     * if its action function includes the name '$next' as a formal parameter. See
     * Handler#execute for more information execution differences between decorators
     * and non-decorators.
     */
    isDecorator: boolean;


    // TODO: doc...
    comment: string;


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
    execute: (request: Request, downstream: (request: Request) => Response) => Response;


    /** Returns a textual representation of this Rule instance. */
    toString() { return `'${this.pattern}': ${this.handler}`; }
}





/**
 * Lists the names of builtins with special meanings when they
 * are used as formal parameter names in handler functions.
 * '$req': injects the current request into the action function.
 * '$yield': marks the action function as a decorator. Injects the
 *           standard `executeDownstreamHandlers` callback into it.
 */
var builtinNames = ['$req', '$next'];





/** Internal function used to create the Rule#execute method. */
function makeExecuteFunction(pattern: Pattern, handler: Function, paramNames: string[]) {

    // Assert the mutual validity of `pattern` and `paramNames`. This allows the body of
    // the 'execute' function to be simpler, as it can safely forego some extra checks.
    validateNames(pattern, paramNames);

    // If the handler function has a formal parameter named '$yield', that signifies this rule as a decorator.
    let isDecorator = paramNames.indexOf('$next') !== -1;

    // Precompute a map with keys that match all of the the `action` function's formal parameter names. The value
    // for each key holds the source code to supply the actual parameter for the corresponding formal parameter.
    let paramMappings = pattern.captureNames.reduce((map, name) => (map[name] = `paramBindings.${name}`, map), {});
    paramMappings['$req'] = 'request';
    paramMappings['$next'] = 'downstream';
    assert(builtinNames.every(bname => !!paramMappings[bname])); // sanity check: ensure all builtins are mapped

    // Generate the source code for the `execute` function. The `execute` function calls the handler function,
    // passing it a set of capture values and/or builtins that correspond to its formal parameter names (a form of DI).
    // The remaining logic depends on whether the rule is a decorator or not, as follows:
    // - for decorators: just call the handler function and return it's result. The '$yield' parameter is bound to the
    //   `executeDownstreamHandlers` callback.
    // - for non-decorators: first call `executeDownstreamHandlers`. If that returned a response, return that response.
    //   Otherwise, execute the handler function and return its response.
    let source = `(function execute(request, downstream) {
        var paramBindings = pattern.match(typeof request === 'string' ? request : request.address);
        if (!paramBindings) return null; // pattern didn't match address
        ${!isDecorator ? `
        var response = downstream(request);
        if (response !== null) return response;
        ` : ''}
        return handler(${paramNames.map(name => paramMappings[name])});
    })`;

    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.
    let result: Function = eval(source);
    return result;
}





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
    assert(ok, `Use of reserved name(s) '${badCaptures.join("', '")}' as capture(s) in pattern '${pattern}'`);

    // Ensure that all capture names appear among the handler's parameter names (i.e. check for unused capture names).
    let excessCaptures = cnames.filter(cname => pnames.indexOf(cname) === -1);
    ok = excessCaptures.length === 0;
    assert(ok, `Capture name(s) '${excessCaptures.join("', '")}' unused by handler in pattern '${pattern}'`);

    // Ensure every parameter name matches either a capture name or a builtin name (i.e. check for unsatisfied params).
    let excessParams = pnames.filter(pname => bnames.indexOf(pname) === -1 && cnames.indexOf(pname) === -1);
    ok = excessParams.length === 0;
    assert(ok, `Handler parameter(s) '${excessParams.join("', '")}' not captured by pattern '${pattern}'`);
}
