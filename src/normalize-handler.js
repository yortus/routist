'use strict';
var pattern_1 = require('./patterns/pattern');
// TODO: doc...
function normalizeHandler(patternSource, handler) {
    // Analyze the pattern and the handler.
    let pattern = new pattern_1.default(patternSource);
    let paramNames = getParamNames(handler);
    let captureNames = pattern.captureNames;
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
// TODO: doc...
// Source: http://stackoverflow.com/a/31194949/1075886
function getParamNames(func) {
    let result = func.toString()
        .replace(/\s+/g, '') // strip all whitespace
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip simple comments
        .split(/\)(?:\{|(?:\=\>))/, 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
    return result;
}
// TODO: doc precond - capture name cannot be any of: ['request', 'req', 'rq', 'tunnel']
function makeCanonicalHandler(pattern, rawHandler, paramNames) {
    let isDecorator = paramNames.indexOf('tunnel') !== -1;
    let paramMappings = pattern.captureNames.reduce((map, name) => (map[name] = `paramBindings.${name}`, map), {});
    paramMappings['req'] = paramMappings['rq'] = 'request';
    let source = `(function (request, tunnel) {

        let paramBindings = pattern.match(request.pathname);
        if (paramBindings === null) return null;

        var response;
        ${isDecorator ? '' : `
        response = tunnel(request);
        if (response !== null) return response;
        `}

        response = rawHandler(${paramNames.map(name => paramMappings[name] || name).join(', ')});
        return response;
    })`;
    let canonicalHandler = eval(source);
    return canonicalHandler;
}
//# sourceMappingURL=normalize-handler.js.map