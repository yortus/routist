'use strict';
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
    // TODO: specific to general...
    var rules = route.slice().reverse();
    // TODO: temp testing...
    // rules.forEach(rule => {
    //     console.log(`${rule.pattern.toString()} [${isPartialHandler(rule.handler) ? 'PARTIAL' : 'GENERAL'}]`);
    // });
    // debugger;
    //TODO: BUG exposed on next line:
    //      - different rules whose pattern source is the same (but maybe they have a different commment) will try to overwrite
    //        the same identifier. They need to all get a unique indentifier! But still keep them human readable (eg append '_1', '_2' etc)
    //      - This BUG is probably also in makeDispatcher... Invesigate... ANS: no, only distinct patterns are used in the dispatcher...
    // TODO: move out to helper function...
    var reservedIds = new Set();
    var handlerIds = rules.reduce(function (map, rule) {
        // TODO: ...
        var base = make_pattern_identifier_1.default(rule.pattern);
        for (var isReserved = true, index = 0; isReserved; ++index) {
            var id = "_" + base + (index ? "_" + index : '');
            isReserved = reservedIds.has(id);
        }
        reservedIds.add(id);
        return map.set(rule, id);
    }, new Map());
    var prolog = rules.map(function (rule, i) { return ("const " + handlerIds.get(rule) + " = rules[" + i + "].handler;\n"); }).join('');
    var bodyLines = ['var response;'];
    // Iterate over rules, from most to least specific
    rules.forEach(function (rule) {
        if (is_partial_handler_1.default(rule.handler)) {
            // TODO: ...
            var line = "if ((response = " + handlerIds.get(rule) + "(address, request)) !== null) return response;";
            bodyLines.push(line);
        }
        else {
            // TODO: ...
            bodyLines.forEach(function (line, i) { return bodyLines[i] = "    " + line; });
            bodyLines.unshift("function downstream(request) {"); // TODO: remove debugger...
            bodyLines.push("    return null;");
            bodyLines.push("}");
            bodyLines.push("");
            bodyLines.push("var response;");
            bodyLines.push("if ((response = " + handlerIds.get(rule) + "(address, request, downstream)) !== null) return response;");
        }
    });
    bodyLines.push("return null;");
    var indent = "    ";
    var body = bodyLines.map(function (line) { return ("" + indent + line + "\n"); }).join('');
    var source = prolog + "\nreturn function _route(address, request) {\n" + body + "}";
    var fn = (function (rules) {
        var fn = eval("(() => {\n" + source + "\n})")();
        return fn;
    })(rules);
    //console.log(fn.toString());
    //debugger;
    return fn;
}
//TODO:
// all handlers: pass in 'address' sneakily as 'this' via Function#call (still very fast!)
// TODO: temp testing...
"\nfunction makeHandler(rules: Rule[]) {\n    say rules = {\n        0: <Root>Partial,\n        1: Partial,\n        2: Decorator,\n        3: Partial,\n        4: Partial,\n        5: <Leaf>Partial\n    }\n\n\n    let handle3_4_5 = function (address, request) {\n        var response;\n        if ((response = handler5(address, request)) !== null) return response;\n        if ((response = handler4(address, request)) !== null) return response;\n        if ((response = handler3(address, request)) !== null) return response;\n        return null;\n    }\n\n    let handle2 = function (address, request) {\n\n        let downstream = function (req) {\n            req = arguments.length > 0 ? req : request;\n            return handle3_4_5(address, req);\n        };\n\n        var response;\n        response = handler2(address, request, handle3_4_5);\n        return response;\n    }\n\n    let handle0_1_2 = function (address, request) {\n        var response;\n        if ((response = handler2(address, request)) !== null) return response;\n        if ((response = handler1(address, request)) !== null) return response;\n        if ((response = handler0(address, request)) !== null) return response;\n        return null;\n    }\n\n    let finalHandler = (address, request) {\n        return handle0_1_2(address, request);\n    }\n\n    \n\n    \n\n\n\n}\n\n\n\n\n\n\n\n\n";
//# sourceMappingURL=make-route-handler.js.map