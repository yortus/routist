'use strict';
var parse_pattern_1 = require('./parse-pattern');
var make_pattern_matcher_1 = require('./make-pattern-matcher');
// TODO: doc...
// TODO: future optimisation: eval a wrapper function that statically passes args from regex captures and from `request`
function normalizeHandler(pattern, handler) {
    // TODO: ...
    let patternAST = parse_pattern_1.default(pattern);
    let matchPattern = make_pattern_matcher_1.default(pattern);
    let paramNames = getParamNames(handler);
    let captureNames = matchPattern.captureNames;
    // TODO: find captures with no matching param...
    let unusedCaptures = captureNames.filter(name => paramNames.indexOf(name) === -1);
    if (unusedCaptures.length > 0) {
        throw new Error(`Unused captures: ${unusedCaptures.join(', ')}`); // TODO: improve error message
    }
    // TODO: find params with no matching capture...
    let unsatisfiedParams = paramNames.filter(name => ['request', 'req', 'rq'].indexOf(name) === -1 && captureNames.indexOf(name) === -1);
    if (unsatisfiedParams.length > 0) {
        throw new Error(`Unsatisfied Parameters: ${unsatisfiedParams.join(', ')}`); // TODO: improve error message
    }
    // TODO: ...
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
function makeCanonicalHandler(rawHandler, paramNames, matchPattern) {
    return (request) => {
        // TODO: ...
        let pathname = request.pathname;
        let matches = matchPattern(pathname);
        if (matches === null)
            return null;
        // TODO: inject args... ensure all accounted for both ways...
        let argNames = Object.keys(matches);
        // TODO: ...
        let argValues = paramNames.map(name => ['request', 'req', 'rq'].indexOf(name) !== -1 ? request : matches[name]);
        let result = rawHandler.apply(null, argValues);
        return result;
    };
}
var dummy = false ? make_pattern_matcher_1.default('') : null;
function makeOrdinaryHandler(rawHandler) {
    `(function (request, traverseInnerHandlers) {

                
        
    })`;
}
//# sourceMappingURL=normalize-handler.js.map