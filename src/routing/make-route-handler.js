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
    // TODO: doc...
    var handlerIds = makeHandlerIdentifiers(rules);
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
// TODO: doc...
function makeHandlerIdentifiers(rules) {
    var reservedIds = new Set();
    var result = rules.reduce(function (map, rule) {
        // TODO: ...
        var base = make_pattern_identifier_1.default(rule.pattern);
        for (var isReserved = true, index = 0; isReserved; ++index) {
            var id = "_" + base + (index ? "_" + index : '');
            isReserved = reservedIds.has(id);
        }
        // TODO: ...
        reservedIds.add(id);
        return map.set(rule, id);
    }, new Map());
    return result;
}
//# sourceMappingURL=make-route-handler.js.map