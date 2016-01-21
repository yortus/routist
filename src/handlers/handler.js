'use strict';
var get_function_parameters_1 = require('./get-function-parameters');
// TODO: doc...
class Handler {
    // TODO: doc...
    constructor(pattern, action) {
        let paramNames = get_function_parameters_1.default(action);
        validateNames(pattern, paramNames);
        this.isDecorator = paramNames.indexOf('$yield') !== -1;
        this.execute = makeExecuteFunction(pattern, action, paramNames);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Handler;
// TODO: doc...
var builtinNames = ['$req', '$yield'];
// TODO: doc...
function validateNames(pattern, paramNames) {
    let bnames = builtinNames;
    let pnames = paramNames;
    let cnames = pattern.captureNames;
    // We already know the capture names are valid JS identifiers. Now also ensure they don't clash with builtin names.
    let badCaptures = cnames.filter(cname => bnames.indexOf(cname) !== -1);
    if (badCaptures.length > 0) {
        throw new Error(`Use of reserved name(s) '${badCaptures.join("', '")}' as capture(s) in pattern '${pattern}'`);
    }
    // Ensure that all capture names appear among the handler's parameter names (i.e. check for unused capture names).
    let excessCaptures = cnames.filter(cname => pnames.indexOf(cname) === -1);
    if (excessCaptures.length > 0) {
        throw new Error(`Capture name(s) '${excessCaptures.join("', '")}' unused by handler in pattern '${pattern}'`);
    }
    // Ensure every parameter name matches either a capture name or a builtin name (i.e. check for unsatisfied params).
    let excessParams = pnames.filter(pname => bnames.indexOf(pname) === -1 && cnames.indexOf(pname) === -1);
    if (excessParams.length > 0) {
        throw new Error(`Handler parameter(s) '${excessParams.join("', '")}' not captured by pattern '${pattern}'`);
    }
}
// TODO: doc precond - capture name cannot be any of: ['$req', '$yield']
// TODO: doc precond - handle func will only ever be called with a matching pathname
// TODO: doc precond - all `paramNames` are either in the pattern's captureNames or are builtins ($req, $yield)
// TODO: doc precond - executeDownstreamHandlers can be called with no arg - and will substitute the current request in that case
/**
 * Internal function used to create the Handler#execute method.
 * TODO: doc preconds
 * @param {Pattern} pattern - TODO
 * @param {Function} action - TODO
 * @param {string[]} paramNames - TODO
 * @return {Function} - TODO
 */
function makeExecuteFunction(pattern, action, paramNames) {
    // If the `action` function has a formal parameter named '$yield', that signifies it as a decorator.
    let isDecorator = paramNames.indexOf('$yield') !== -1;
    // Precompute a map with keys that match all of the the `action` function's formal parameter names. The value
    // for each key holds the source code to supply the actual parameter for the corresponding formal parameter.
    let paramMappings = pattern.captureNames.reduce((map, name) => (map[name] = `paramBindings.${name}`, map), {});
    paramMappings['$req'] = 'request';
    paramMappings['$yield'] = 'executeDownstreamHandlers';
    // Generate the source code for the `execute` function. The `execute` function calls the `action` function,
    // passing it a set of capture values and/or builtins that correspond to its formal parameter names (a form of DI).
    // The remaining logic depends on whether the `action` function is a decorator or not, as follows:
    // - for decorators: just call the `action` function and return it's result. The '$yield' parameter is bound to the
    //   `executeDownstreamHandlers` callback.
    // - for non-decorators: first call `executeDownstreamHandlers`. If that returned a response, return that response.
    //   Otherwise, execute the `action` function and return its response.
    // NB: given `makeExecuteFunction`'s preconditions, a number of checks can be elided in the implementation.
    let source = `(function execute(request, executeDownstreamHandlers) {
        var paramBindings = pattern.match(request.pathname);
        ${!isDecorator ? `
        var response = executeDownstreamHandlers();
        if (response !== null) return response;
        ` : ''}
        return action(${paramNames.map(name => paramMappings[name])});
    })`;
    // Evaluate the handler source into a function, and return it. The use of eval here is safe as there
    // are no untrusted inputs. The resulting evaled function is fast and suitable for use on a hot path.
    let result = eval(source);
    return result;
}
//# sourceMappingURL=handler.js.map