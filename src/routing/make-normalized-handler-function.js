'use strict';
var assert = require('assert');
var util_1 = require('../util');
var pattern_1 = require('../patterns/pattern');
/** Internal function used to create the Rule#execute method. */
function makeNormalizedHandlerFunction(pattern, rawHandler) {
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
    var source;
    if (isDecorator) {
        source = "(function decorate(request, downstream) {\n            var paramBindings = match(typeof request === 'string' ? request : request.address);\n            if (!paramBindings) return null; // pattern didn't match address\n\n            return rawHandler(" + paramNames.map(function (name) { return paramMappings[name]; }) + ");\n        })";
    }
    else {
        source = "(function handle(request) {\n            var paramBindings = match(typeof request === 'string' ? request : request.address);\n            if (!paramBindings) return null; // pattern didn't match address\n\n            // TODO: temp hack until next comment is addressed...\n            var downstream = arguments[1];\n\n            // TODO: implement this logic elsewhere in a combined handler...\n            var response = downstream(request);\n            if (response !== null) return response;\n\n            return rawHandler(" + paramNames.map(function (name) { return paramMappings[name]; }) + ");\n        })";
    }
    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.
    var result = eval(source);
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeNormalizedHandlerFunction;
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
//# sourceMappingURL=make-normalized-handler-function.js.map