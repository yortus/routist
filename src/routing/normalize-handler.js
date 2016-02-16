'use strict';
var assert = require('assert');
var util_1 = require('../util');
var make_pattern_identifier_1 = require('./make-pattern-identifier');
var pattern_1 = require('../pattern');
// TODO: review jsdocs after pattern overhaul
// TODO: make async...
// TODO: review all comments given recent changes (Handler/Rule, $yield/$next, executeDownstreamHandlers/downstream)
// TODO: use getIdForPattern from ./make-dispatch-function to generate unique/pretty handler function names
// TODO: review comments below...
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
// export type HandlerFunction = (request: Request) => Response;
// export type DecoratorFunction = (request: Request, downstream: HandlerFunction) => Response;
/** Internal function used to create the Rule#execute method. */
// TODO: incorporate this comment from old Rule class...
//     /**
//      * Constructs a Rule instance.
//      * @param {string} patternSource - the pattern recognized by this handler.
//      * @param {Function} handler - a function providing processing logic for producing
//      *        a reponse from a given request. The `action` function may be invoked when
//      *        the `Handler#execute` method is called. Each of the `action` function's
//      *        formal parameter names must match either a capture name from `pattern`, or
//      *        a builtin name such as `$req` or `$yield`. Capture values and/or builtin
//      *        values are passed to the matching parameters of `action` upon invocation.
//      *        A non-null return value from `action` is interpreted as a response. A null
//      *        return value from `action` signifies that the action declined to respond to
//      *        the given request, even if the pattern matched the request's address.
//      */
function normalizeHandler(pattern, rawHandler) {
    // TODO: get capture names and match function... review these lines...
    // TODO: integrate back into pattern class?
    var paramNames = util_1.getFunctionParameterNames(rawHandler);
    var captureNames = pattern.captureNames;
    var match = pattern.match;
    // Assert the mutual validity of `pattern` and `paramNames`. This allows the body of
    // the 'execute' function to be simpler, as it can safely forego some extra checks.
    validateNames(pattern, captureNames, paramNames);
    // If the handler function has a formal parameter named '$yield', that signifies this rule as a decorator.
    var isDecorator = paramNames.indexOf('$next') !== -1;
    // Precompute a map with keys that match all of the the `action` function's formal parameter names. The value
    // for each key holds the source code to supply the actual parameter for the corresponding formal parameter.
    var paramMappings = captureNames.reduce(function (map, name) { return (map[name] = "paramBindings." + name, map); }, {});
    paramMappings['$req'] = 'request';
    paramMappings['$next'] = 'downstream';
    assert(builtinNames.every(function (bname) { return !!paramMappings[bname]; })); // sanity check: ensure all builtins are mapped
    // Generate the source code for the `execute` function. The `execute` function calls the handler function,
    // passing it a set of capture values and/or builtins that correspond to its formal parameter names (a form of DI).
    // The remaining logic depends on whether the rule is a decorator or not, as follows:
    // - for decorators: just call the handler function and return it's result. The '$yield' parameter is bound to the
    //   `executeDownstreamHandlers` callback.
    // - for non-decorators: first call `executeDownstreamHandlers`. If that returned a response, return that response.
    //   Otherwise, execute the handler function and return its response.
    var source = "(function __" + make_pattern_identifier_1.default(pattern) + "__(request" + (isDecorator ? ', downstream' : '') + ") {\n        var paramBindings = match(typeof request === 'string' ? request : request.address);\n        if (!paramBindings) return null; // pattern didn't match address\n        return rawHandler(" + paramNames.map(function (name) { return paramMappings[name]; }) + ");\n    })";
    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.
    var result = eval(source);
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = normalizeHandler;
/**
 * Lists the names of builtins with special meanings when they
 * are used as formal parameter names in handler functions.
 * '$req': injects the current request into the action function.
 * '$yield': marks the action function as a decorator. Injects the
 *           standard `executeDownstreamHandlers` callback into it.
 */
var builtinNames = ['$req', '$next'];
/**
 * Asserts the mutual validity of a pattern's capture names with an action's parameter names:
 * - Every parameter name must match either a capture name or a builtin name.
 * - Every capture name in the pattern must also be present among the action's parameter names.
 * - None of the pattern's capture names may match a builtin name.
 */
function validateNames(pattern, captureNames, paramNames) {
    var bnames = builtinNames;
    var pnames = paramNames;
    var cnames = captureNames;
    // We already know the capture names are valid JS identifiers. Now also ensure they don't clash with builtin names.
    var badCaptures = cnames.filter(function (cname) { return bnames.indexOf(cname) !== -1; });
    var ok = badCaptures.length === 0;
    assert(ok, "Use of reserved name(s) '" + badCaptures.join("', '") + "' as capture(s) in pattern '" + pattern_1.default + "'");
    // Ensure that all capture names appear among the handler's parameter names (i.e. check for unused capture names).
    var excessCaptures = cnames.filter(function (cname) { return pnames.indexOf(cname) === -1; });
    ok = excessCaptures.length === 0;
    assert(ok, "Capture name(s) '" + excessCaptures.join("', '") + "' unused by handler in pattern '" + pattern + "'");
    // Ensure every parameter name matches either a capture name or a builtin name (i.e. check for unsatisfied params).
    var excessParams = pnames.filter(function (pname) { return bnames.indexOf(pname) === -1 && cnames.indexOf(pname) === -1; });
    ok = excessParams.length === 0;
    assert(ok, "Handler parameter(s) '" + excessParams.join("', '") + "' not captured by pattern '" + pattern + "'");
}
//# sourceMappingURL=normalize-handler.js.map