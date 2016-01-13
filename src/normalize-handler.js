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
    // TODO: ...
    let canonicalHandler = ((request) => {
        // TODO: ...
        let pathname = request.pathname;
        let matches = matchPattern(pathname);
        if (matches === null) {
            // TODO: should never get here due to invariants - only gets called if pathname already matched against pattern
            throw new Error('internal error');
        }
        else {
            // TODO: inject args... ensure all accounted for both ways...
            let argNames = Object.keys(matches);
            // TODO: find captures with no matching param...
            let unusedCaptures = argNames.filter(name => paramNames.indexOf(name) === -1);
            if (unusedCaptures.length > 0) {
                throw new Error(`Unused captures: ${unusedCaptures.join(', ')}`); // TODO: improve error message
            }
            // TODO: find params with no matching capture...
            let unsatisfiedParams = paramNames.filter(name => ['request', 'req', 'rq'].indexOf(name) === -1 && argNames.indexOf(name) === -1);
            if (unsatisfiedParams.length > 0) {
                throw new Error(`Unsatisfied Parameters: ${unsatisfiedParams.join(', ')}`); // TODO: improve error message
            }
            // TODO: ...
            let args = paramNames.map(name => ['request', 'req', 'rq'].indexOf(name) !== -1 ? request : matches[name]);
            let result = handler.apply(null, args);
            return result;
        }
    });
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
//# sourceMappingURL=normalize-handler.js.map