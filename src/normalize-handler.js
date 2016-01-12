'use strict';
var parse_pattern_1 = require('./parse-pattern');
var make_pattern_matcher_1 = require('./make-pattern-matcher');
// TODO: doc...
function normalizeHandler(pattern, handler) {
    let patternAST = parse_pattern_1.default(pattern);
    let matchPattern = make_pattern_matcher_1.default(pattern);
    let handlerParamNames = getParamNames(handler);
    let canonicalHandler = ((request) => {
        let pathname = request.pathname;
        let matches = matchPattern(pathname);
        if (matches === null) {
        }
        else {
        }
    });
    canonicalHandler.type = handler.type;
    return canonicalHandler;
}
exports.default = normalizeHandler;
// TODO: doc...
// Source: http://stackoverflow.com/a/31194949/1075886
function getParamNames(func) {
    return (func + '')
        .replace(/\s+/g, '') // strip spaces
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip simple comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
}
//# sourceMappingURL=normalize-handler.js.map