'use strict';
var is_partial_handler_1 = require('./is-partial-handler');
var make_pattern_identifier_1 = require('./make-pattern-identifier');
// TODO: ...
function makeRouteHandler(route) {
    var reverseRoute = route.slice().reverse();
    var name = '__' + make_pattern_identifier_1.default(reverseRoute[0].pattern) + '__';
    // TODO: ...
    var execute = reverseRoute.reduce(function (downstream, rule) {
        var handler = rule.handler;
        if (is_partial_handler_1.default(handler)) {
            return function (address, request) {
                var response = downstream(address, request);
                if (response !== null)
                    return response;
                return handler(address, request);
            };
        }
        else {
            return function (address, request) { return handler(address, request, downstream); };
        }
    }, nullHandler);
    // TODO: needless wrapping of func-in-func?
    var source = "function " + name + "(address, request) { return execute(address, request); }";
    var result = eval("(" + source + ")");
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeRouteHandler;
// TODO: ...
var nullHandler = function (address, request) { return null; };
//# sourceMappingURL=make-route-handler.js.map