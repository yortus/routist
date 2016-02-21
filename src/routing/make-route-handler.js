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
    var lines = rules.map(function (rule, i) { return ("const " + handlerIds.get(rule) + " = rules[" + i + "].handler;"); }).concat([
        '',
        'return function _route(address, request) {',
        '    var response;'
    ], getBodyLines(rules, handlerIds, 1), [
        '};'
    ]);
    // console.log(lines);
    // debugger;
    var fn = eval("(() => {\n" + lines.join('\n') + "\n})")();
    // let prolog = rules.map((rule, i) => `const ${handlerIds.get(rule)} = rules[${i}].handler;\n`).join('');
    // let indent = `    `;
    // let body = bodyLines.map(line => `${indent}${line}\n`).join('');
    // let source = `${prolog}\nreturn function _route(address, request) {\n${body}}`;
    // let fn = (function(rules) {
    //     let fn = eval(`(() => {\n${source}\n})`)();
    //     return fn;
    // })(rules);
    console.log("\n\n\n\n\n" + fn.toString());
    //debugger;
    return fn;
}
// TODO: doc...
function getBodyLines(rules, handlerIds, nestDepth) {
    var indent = '    '.repeat(nestDepth); // TODO: rename to 'tab' here and in makeDispatcher? Clearer?
    var lines = [];
    // Iterate over rules, from most to least specific
    rules.forEach(function (rule) {
        if (is_partial_handler_1.default(rule.handler)) {
            // TODO: ...
            var line = indent + "if ((response = " + handlerIds.get(rule) + "(address, request)) !== null) return response;";
            lines.push(line);
        }
        else {
            // TODO: ...
            lines = [
                (indent + "function downstream(request) {")
            ].concat(lines.map(function (line) { return ("" + indent + line); }), [
                ("" + indent + indent + "return null;"),
                (indent + "}"),
                "",
                //`${indent}var response;`,
                (indent + "if ((response = " + handlerIds.get(rule) + "(address, request, downstream)) !== null) return response;")
            ]);
        }
    });
    lines.push(indent + "return null;");
    return lines;
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
function _route1(address, request) {
    var response;
    function downstream(request) {
        function downstream(request) {
            if ((response = _apiﾉfoᕽo(address, request)) !== null)
                return response;
            return null;
        }
        if ((response = _apiﾉfoᕽ(address, request, downstream)) !== null)
            return response;
        return null;
    }
    if ((response = _apiﾉfoᕽ_1(address, request, downstream)) !== null)
        return response;
    if ((response = _apiﾉ﹍(address, request)) !== null)
        return response;
    if ((response = _apiﾉ﹍_1(address, request)) !== null)
        return response;
    if ((response = _﹍(address, request)) !== null)
        return response;
    return null;
}
function _route2(address, request) {
    var response;
    function downstream(request) {
        function downstream(request) {
            return null;
        }
        if ((response = _apiﾉfoᕽ(address, request, downstream)) !== null)
            return response;
        return null;
    }
    if ((response = _apiﾉfoᕽ_1(address, request, downstream)) !== null)
        return response;
    if ((response = _apiﾉ﹍(address, request)) !== null)
        return response;
    if ((response = _apiﾉ﹍_1(address, request)) !== null)
        return response;
    if ((response = _﹍(address, request)) !== null)
        return response;
    return null;
}
function _route3(address, request) {
    var response;
    function downstream(request) {
        function downstream(request) {
            function downstream(request) {
                if ((response = _apiﾉfoo(address, request)) !== null)
                    return response;
                return null;
            }
            if ((response = _apiﾉfoo_1(address, request, downstream)) !== null)
                return response;
            if ((response = _apiﾉfoᕽo(address, request)) !== null)
                return response;
            return null;
        }
        if ((response = _apiﾉfoᕽ(address, request, downstream)) !== null)
            return response;
        return null;
    }
    if ((response = _apiﾉfoᕽ_1(address, request, downstream)) !== null)
        return response;
    if ((response = _apiﾉ﹍(address, request)) !== null)
        return response;
    if ((response = _apiﾉ﹍_1(address, request)) !== null)
        return response;
    if ((response = _﹍(address, request)) !== null)
        return response;
    return null;
}
//# sourceMappingURL=make-route-handler.js.map