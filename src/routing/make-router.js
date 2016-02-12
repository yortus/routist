'use strict';
var is_partial_handler_1 = require('./is-partial-handler');
var make_pattern_identifier_1 = require('./make-pattern-identifier');
// TODO: ...
function makeRouter(ruleWalk) {
    var reverseRuleWalk = ruleWalk.slice().reverse();
    var name = '__' + make_pattern_identifier_1.default(reverseRuleWalk[0].pattern) + '__';
    // TODO: ...
    var execute = reverseRuleWalk.reduce(function (downstream, rule) {
        var handler = rule.handler;
        if (is_partial_handler_1.default(handler)) {
            return function (request) {
                var response = downstream(request);
                if (response !== null)
                    return response;
                return handler(request);
            };
        }
        else {
            return function (request) { return handler(request, downstream); };
        }
    }, nullHandler);
    var source = "function " + name + "(request) { return execute(request); }";
    var result = eval("(" + source + ")");
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeRouter;
// TODO: ...
var nullHandler = function (request) { return null; };
//# sourceMappingURL=make-router.js.map