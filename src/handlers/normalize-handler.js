'use strict';
var get_function_parameters_1 = require('./get-function-parameters');
// TODO: doc...
// TODO: handle any type for `handler`? ie not just a function?
function normalizeHandler(pattern, handler) {
    // Analyze the pattern and the handler.
    let captureNames = pattern.captureNames;
    let paramNames = get_function_parameters_1.default(handler);
    // Ensure capture names are legal. In particular, check for reserved names.
    // TODO: also disallow any name that might be on the Object prototype...
    let reservedNames = ['$req', '$yield'];
    reservedNames.forEach(reservedName => {
        if (captureNames.indexOf(reservedName) !== -1) {
            throw new Error(`Reserved name '${reservedName}' used as capture name in pattern '${pattern}'`);
        }
    });
    // Throw an error if there are named captures in the pattern with no corresponding parameter in the handler.
    let unusedCaptures = captureNames.filter(name => paramNames.indexOf(name) === -1);
    if (unusedCaptures.length > 0) {
        throw new Error(`Unused captures: ${unusedCaptures.join(', ')}`); // TODO: improve error message
    }
    // Throw an error if the handler has parameters that do not correspond to a named capture or to a built-in.
    let unsatisfiedParams = paramNames.filter(name => reservedNames.indexOf(name) === -1 && captureNames.indexOf(name) === -1);
    if (unsatisfiedParams.length > 0) {
        throw new Error(`Unsatisfied parameters: ${unsatisfiedParams.join(', ')}`); // TODO: improve error message
    }
    // Create and return an equivalent handler in normalized form.
    let canonicalHandler = makeHandleFunction(pattern, handler, paramNames);
    return canonicalHandler;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = normalizeHandler;
// TODO: doc precond - capture name cannot be any of: ['$req', '$yield']
// TODO: doc precond - handle func will only ever be called with a matching pathname
// TODO: doc precond - all `paramNames` are either in the pattern's captureNames or are builtins ($req, $yield)
// TODO: doc precond - executeDownstreamHandlers can be called with no arg - and will substitute the current request in that case
function makeHandleFunction(pattern, originalHandler, paramNames) {
    // If the original handler has a formal parameter named '$yield', that signifies it as a decorator.
    let isDecorator = paramNames.indexOf('$yield') !== -1;
    // Precompute a map with keys that match all of the the original function's formal parameter names.
    // The value for each key holds the source code to supply the actual parameter for the corresponding formal parameter.
    let paramMappings = pattern.captureNames.reduce((map, name) => (map[name] = `paramBindings.${name}`, map), {});
    paramMappings['$req'] = 'request';
    paramMappings['$yield'] = 'executeDownstreamHandlers';
    // Generate the source code for the normalized handler function. The handler function calls the original handler,
    // passing it a set of capture values and/or built-ins that correspond to its formal parameter names (a form of D.I.).
    // The remaining logic depends on whether the original handler is a decorator or not, as follows:
    // - for decorators: just call the original handler and return it's result. The '$yield' parameter is bound to the
    //   `executeDownstreamHandlers` callback.
    // - for non-decorators: first call `executeDownstreamHandlers`. If that returned a response, return that response.
    //   Otherwise, execute the original handler and return its response.
    // NB: given `makeHandleFunction`'s preconditions, a number of checks can be elided in the implementation.
    let source = `(function handle(request, executeDownstreamHandlers) {
        var paramBindings = pattern.match(request.pathname);
        ${!isDecorator ? `
        var response = executeDownstreamHandlers();
        if (response !== null) return response;
        ` : ''}
        return originalHandler(${paramNames.map(name => paramMappings[name])});
    })`;
    // Evaluate the handler source into a function, and return it. The use of eval here is safe as there
    // are no untrusted inputs. The resulting evaled function is fast and suitable for use on a hot path.
    let canonicalHandler = eval(source);
    canonicalHandler.isDecorator = isDecorator;
    return canonicalHandler;
}
//# sourceMappingURL=normalize-handler.js.map