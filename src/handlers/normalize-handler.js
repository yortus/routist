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
    let reservedNames = ['request', 'req', 'rq', 'tunnel'];
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
    let canonicalHandler = makeCanonicalHandler(pattern, handler, paramNames);
    return canonicalHandler;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = normalizeHandler;
// TODO: doc precond - capture name cannot be any of: ['request', 'req', 'rq', 'tunnel']
function makeCanonicalHandler(pattern, originalHandler, paramNames) {
    // If the original handler has 'tunnel' as a formal parameter, that signifies that it is a decorator.
    let isDecorator = paramNames.indexOf('tunnel') !== -1;
    // Precompute a map with keys that match all of the the original function's formal parameter names.
    // The value for each key holds the source code to supply the actual parameter for the corresponding formal parameter.
    let paramMappings = pattern.captureNames.reduce((map, name) => (map[name] = `paramBindings.${name}`, map), {});
    paramMappings['request'] = paramMappings['req'] = paramMappings['rq'] = 'request';
    paramMappings['tunnel'] = 'tunnel';
    let source = `(function (request, tunnel) {

        let paramBindings = pattern.match(request.pathname);
        if (paramBindings === null) return null;

        var response;
        ${isDecorator ? '' : `
        response = tunnel(request);
        if (response !== null) return response;
        `}

        response = originalHandler(${paramNames.map(name => paramMappings[name] || '#ILLEGAL!').join(', ')});
        return response;
    })`;
    let canonicalHandler = eval(source);
    canonicalHandler.isDecorator = isDecorator;
    return canonicalHandler;
}
//# sourceMappingURL=normalize-handler.js.map