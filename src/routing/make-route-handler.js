'use strict';
var assert = require('assert');
var is_partial_handler_1 = require('./is-partial-handler');
var make_pattern_identifier_1 = require('./make-pattern-identifier');
// TODO: ...
function makeRouteHandler(route) {
    // TODO: temp testing...
    if (route.length > 4) {
        return makeRouteHandler2(route);
    }
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
function makeRouteHandler2(route) {
    //debugger;
    var prolog = route.map(function (_a, i) {
        var pattern = _a.pattern, handler = _a.handler;
        return ("var _" + make_pattern_identifier_1.default(pattern) + " = route[" + i + "].handler;\n");
    }).join('');
    var body = 'var response;\n';
    // Iterate over rules, from most to least specific
    for (var i = route.length - 1; i >= 0; --i) {
        var _a = route[i], pattern = _a.pattern, handler = _a.handler;
        // TODO: temp just for now...
        assert(is_partial_handler_1.default(handler));
        var line = "if ((response = _" + make_pattern_identifier_1.default(pattern) + "(address, request)) !== null) return response;\n";
        body += line;
    }
    body += "return null;\n";
    var source = prolog + "\nreturn function _route(address, request) {try{\n" + body + "}catch(ex){\ndebugger;      \n } }";
    var fn = (function (route) {
        var fn = eval("(() => {\n" + source + "\n})")();
        return fn;
    })(route);
    console.log(fn.toString());
    debugger;
    return fn;
}
//TODO:
// all handlers: pass in 'address' sneakily as 'this' via Function#call (still very fast!)
// TODO: temp testing...
"\nfunction makeHandler(rules: Rule[]) {\n    say rules = {\n        0: <Root>Partial,\n        1: Partial,\n        2: Decorator,\n        3: Partial,\n        4: Partial,\n        5: <Leaf>Partial\n    }\n\n\n    let handle3_4_5 = function (address, request) {\n        var response;\n        if ((response = handler5(address, request)) !== null) return response;\n        if ((response = handler4(address, request)) !== null) return response;\n        if ((response = handler3(address, request)) !== null) return response;\n        return null;\n    }\n\n    let handle2 = function (address, request) {\n\n        let downstream = function (req) {\n            req = arguments.length > 0 ? req : request;\n            return handle3_4_5(address, req);\n        };\n\n        var response;\n        response = handler2(address, request, handle3_4_5);\n        return response;\n    }\n\n    let handle0_1_2 = function (address, request) {\n        var response;\n        if ((response = handler2(address, request)) !== null) return response;\n        if ((response = handler1(address, request)) !== null) return response;\n        if ((response = handler0(address, request)) !== null) return response;\n        return null;\n    }\n\n    let finalHandler = (address, request) {\n        return handle0_1_2(address, request);\n    }\n\n    \n\n    \n\n\n\n}\n\n\n\n\n\n\n\n\n";
//# sourceMappingURL=make-route-handler.js.map