'use strict';
var parse_pattern_1 = require('./parse-pattern');
var make_pattern_matcher_1 = require('./make-pattern-matcher');
// TODO: doc...
// TODO: future optimisation: eval a wrapper function that statically passes args from regex captures and from `request`
function normalizeHandler(pattern, handler) {
    // Analyze the pattern and the handler.
    let patternAST = parse_pattern_1.default(pattern);
    let matchPattern = make_pattern_matcher_1.default(pattern);
    let paramNames = getParamNames(handler);
    let captureNames = matchPattern.captureNames;
    // Ensure capture names are legal. In particular, check for reserved names.
    let reservedNames = ['request', 'req', 'rq', 'handle'];
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
    let canonicalHandler = makeCanonicalHandler(handler, paramNames, matchPattern);
    return canonicalHandler;
}
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
// TODO: add fast/noDebug case that uses eval...
// TODO: doc precond - capture name cannot be any of: ['request', 'req', 'rq', 'handle']
function makeCanonicalHandler(rawHandler, paramNames, matchPattern) {
    return (request, traverseInnerHandlers) => {
        // TODO: ...
        let pathname = request.pathname;
        let paramBindings = matchPattern(pathname);
        if (paramBindings === null)
            return null;
        // TODO: ...
        paramBindings['request'] = paramBindings['req'] = paramBindings['rq'] = request;
        paramBindings['handle'] = (req) => traverseInnerHandlers(req || request);
        let argValues = paramNames.map(name => paramBindings[name]);
        // TODO: ...
        if (paramNames.indexOf('handle') !== -1) {
            // TODO: decorator processing...
            let response = rawHandler.apply(null, argValues);
            return response;
        }
        else {
            // TODO: normal handler processing...
            // TODO: only attempt running rawHandler if the inner handlers don't handle the request...
            let response = traverseInnerHandlers(request);
            if (response !== null)
                return response;
            // TODO: run this handler...
            response = rawHandler.apply(null, argValues);
            return response;
        }
    };
}
var dummy = false ? make_pattern_matcher_1.default('') : null;
//# sourceMappingURL=normalize-handler.js.map