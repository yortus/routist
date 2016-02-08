'use strict';
var is_decorator_1 = require('./is-decorator');
// TODO: ...
var Route = (function () {
    // TODO: ...
    function Route(rules) {
        this.rules = rules;
        var reverseRules = rules.slice().reverse();
        this.name = reverseRules[0].pattern.toString();
        this.execute = reverseRules.reduce(function (downstream, rule) {
            var handler = rule.execute;
            if (is_decorator_1.default(handler)) {
                return function (request) { return handler(request, downstream); };
            }
            else {
                return function (request) {
                    var response = downstream(request);
                    if (response !== null)
                        return response;
                    return handler(request);
                };
            }
        }, noMore);
    }
    return Route;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Route;
// TODO: ...
var noMore = function (rq) { return null; };
//# sourceMappingURL=route.js.map