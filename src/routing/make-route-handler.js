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
//TODO:
// all handlers: pass in 'address' sneakily as 'this' via Function#call (still very fast!)
// TODO: temp testing...
"\nfunction makeHandler(rules: Rule[]) {\n    say rules = {\n        0: <Root>Partial,\n        1: Partial,\n        2: Decorator,\n        3: Partial,\n        4: Partial,\n        5: <Leaf>Partial\n    }\n\n\n    let handle3_4_5 = function (address, request) {\n        var response;\n        if ((response = handler5(address, request)) !== null) return response;\n        if ((response = handler4(address, request)) !== null) return response;\n        if ((response = handler3(address, request)) !== null) return response;\n        return null;\n    }\n\n    let handle2 = function (address, request) {\n\n        // NB: closes over address... therefore need new function/closure for EVERY request!!! how to avoid??? Function#bind?\n        let downstream = function (req) {\n            req = arguments.length > 0 ? req : request;\n            return handle3_4_5(address, req);\n        };\n\n        var response;\n        response = handler2(address, request, handle3_4_5);\n        return response;\n    }\n\n    let handle0_1_2 = function (address, request) {\n        var response;\n        if ((response = handler2(address, request)) !== null) return response;\n        if ((response = handler1(address, request)) !== null) return response;\n        if ((response = handler0(address, request)) !== null) return response;\n        return null;\n    }\n\n    let finalHandler = (address, request) {\n        return handle0_1_2(address, request);\n    }\n\n    \n\n    \n\n\n\n}\n\n\n\n\n\n\n\n\n";
//# sourceMappingURL=make-route-handler.js.map