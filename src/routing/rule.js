'use strict';
var assert = require('assert');
var util_1 = require('../util');
var pattern_1 = require('../pattern');
// TODO: review all jsdocs below after reshuffle between files...
// TODO: doc...
var Rule = (function () {
    // TODO: doc...
    function Rule(rawPattern, rawHandler) {
        var pattern = this.pattern = new pattern_1.default(rawPattern); // NB: may throw...
        var paramNames = this.parameterNames = util_1.getFunctionParameterNames(rawHandler);
        validateNames(pattern, paramNames); // NB: may throw...
        this.handler = rawHandler;
        this.isDecorator = paramNames.indexOf('$next') !== -1;
    }
    return Rule;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Rule;
/**
 * Lists the names of builtins with special meanings when they
 * are used as formal parameter names in handler functions.
 * '$req': injects the current request into the action function.
 * '$yield': marks the action function as a decorator. Injects the
 *           standard `executeDownstreamHandlers` callback into it.
 */
var builtinNames = ['$addr', '$req', '$next']; // TODO: temp testing remove $addr!
/**
 * Asserts the mutual validity of a pattern's capture names with an action's parameter names:
 * - Every parameter name must match either a capture name or a builtin name.
 * - Every capture name in the pattern must also be present among the action's parameter names.
 * - None of the pattern's capture names may match a builtin name.
 */
function validateNames(pattern, paramNames) {
    var bnames = builtinNames;
    var pnames = paramNames;
    var cnames = pattern.captureNames;
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
//# sourceMappingURL=rule.js.map