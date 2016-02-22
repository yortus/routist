'use strict';
var util_1 = require('../util');
var is_partial_handler_1 = require('./is-partial-handler');
var make_pattern_identifier_1 = require('./make-pattern-identifier');
function makeRouteHandler(route) {
    // TODO: specific to general...
    var rules = route.slice().reverse();
    // TODO: doc...
    var handlerIds = makeHandlerIdentifiers(rules);
    var lines = rules.map(function (rule, i) { return ("var match" + handlerIds.get(rule) + " = rules[" + i + "].pattern.match;"); }).filter(function (_, i) { return rules[i].pattern.captureNames.length > 0; }).concat(rules.map(function (rule, i) { return ("var handle" + handlerIds.get(rule) + " = rules[" + i + "].handler;"); }), [
        '',
        'function no_downstream(req) { return null; }',
        '',
        ("return function route" + handlerIds.get(rules[0]) + "(address, request) {")
    ], getBodyLines(rules, handlerIds).map(function (line) { return ("    " + line); }), [
        '};'
    ]);
    //console.log(lines);
    //debugger;
    var fn = eval("(() => {\n" + lines.join('\n') + "\n})")();
    console.log("\n\n\n\n\n" + fn.toString());
    //debugger;
    return fn;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeRouteHandler;
// TODO: doc...
function getBodyLines(rules, handlerIds) {
    var rules2 = rules.slice();
    var body2 = ["var addr = address, req = request, res, captures;"]; // TODO: think about deopt due to 'captures' being re-used with different props...
    var lines2 = [];
    var downstreamRule;
    // TODO: Iterate over rules, from most to least specific
    while (rules2.length > 0) {
        if (!is_partial_handler_1.default(rules2[0].handler)) {
            if (lines2.length > 0) {
                body2 = body2.concat([
                    ("function downstream_of" + handlerIds.get(downstreamRule) + "(req) {"),
                    "    if (req === void 0) req = request;"
                ], lines2.map(function (line) { return ("    " + line); }), [
                    "}"
                ]);
                lines2 = [];
            }
        }
        var runCount = rules2.slice(1).findIndex(function (rule) { return !is_partial_handler_1.default(rule.handler); }) + 1;
        if (runCount === 0)
            runCount = rules2.length;
        var run = rules2.slice(0, runCount);
        rules2 = rules2.slice(runCount);
        var _loop_1 = function() {
            var rule = run.shift();
            var paramNames = util_1.getFunctionParameterNames(rule.handler);
            var captureNames = rule.pattern.captureNames;
            var paramMappings = captureNames.reduce(function (map, name) { return (map[name] = "captures." + name, map); }, {});
            if (captureNames.length > 0)
                lines2.push("captures = match" + handlerIds.get(rule) + "(addr);");
            var builtinMappings = {
                $addr: 'addr',
                $req: 'req',
                $next: is_partial_handler_1.default(rule.handler) ? '' : "" + (downstreamRule ? "downstream_of" + handlerIds.get(downstreamRule) : 'no_downstream')
            };
            //let downstream = isPartialHandler(rule.handler) ? '' : `${downstreamRule ? `downstream_of${handlerIds.get(downstreamRule)}` : 'no_downstream'}`;
            var pre = run.length > 0 ? "if ((res = " : "return ";
            var post = run.length > 0 ? ") !== null) return res;" : ";";
            lines2.push(pre + "handle" + handlerIds.get(rule) + "(" + paramNames.map(function (name) { return paramMappings[name] || builtinMappings[name]; }).join(', ') + ")" + post);
            if (run.length === 0)
                downstreamRule = rules2[0];
        };
        while (run.length > 0) {
            _loop_1();
        }
    }
    body2 = body2.concat(lines2);
    return body2;
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