'use strict';
var is_decorator_1 = require('./is-decorator');
var make_pattern_identifier_1 = require('./make-pattern-identifier');
// TODO: ...
function makeRouter(ruleWalk) {
    var reverseRuleWalk = ruleWalk.slice().reverse();
    var name = '__' + make_pattern_identifier_1.default(reverseRuleWalk[0].pattern) + '__';
    // TODO: ...
    var execute = reverseRuleWalk.reduce(function (downstream, rule) {
        var result;
        var handler = rule.handler; // TODO: fix cast
        if (is_decorator_1.default(rule.handler)) {
            result = function (request) { return handler(request, downstream); };
        }
        else {
            result = function (request) {
                var response = downstream(request);
                if (response !== null)
                    return response;
                return handler(request);
            };
        }
        return result;
    }, noMore);
    var source = "function " + name + "(request) { return execute(request); }";
    var result;
    result = eval("(" + source + ")");
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeRouter;
// TODO: ...
var noMore = function (rq) { return null; };
//# sourceMappingURL=make-router.js.map