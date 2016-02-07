'use strict';
// TODO: ...
var Route = (function () {
    // TODO: ...
    function Route(rules) {
        this.rules = rules;
        var reverseRules = rules.slice().reverse();
        this.name = reverseRules[0].pattern.toString();
        this.execute = reverseRules.reduce(function (downstream, rule) { return function (request) { return rule.execute(request, downstream); }; }, noMore);
    }
    return Route;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Route;
// TODO: ...
var noMore = function (rq) { return null; };
//# sourceMappingURL=route.js.map