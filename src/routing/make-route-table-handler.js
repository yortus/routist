'use strict';
var assert = require('assert');
var util_1 = require('util');
var util_2 = require('../util');
var taxonomy_1 = require('../taxonomy');
var is_partial_handler_1 = require('./is-partial-handler');
var make_dispatcher_1 = require('./make-dispatcher');
var make_route_handler_1 = require('./make-route-handler');
var normalize_handler_1 = require('./normalize-handler');
var pattern_1 = require('../pattern');
// TODO: doc...
function makeRouteTableHandler(routeTable) {
    // TODO: ...
    var taxonomy = taxonomy_1.default.from(Object.keys(routeTable).map(function (src) { return new pattern_1.default(src); }));
    // TODO: ...
    var routeHandlers = makeAllRouteHandlers(taxonomy, routeTable);
    // TODO: ...
    var selectRouteHandler = make_dispatcher_1.default(taxonomy, routeHandlers);
    // TODO: ...
    function __compiledRouteTable__(request) {
        var address = typeof request === 'string' ? request : request.address;
        var handleRoute = selectRouteHandler(address);
        var response = handleRoute(request);
        return response;
    }
    ;
    return __compiledRouteTable__;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeRouteTableHandler;
// TODO: ...
function makeAllRouteHandlers(taxonomy, routeTable) {
    // Get a list of all the distinct patterns that occur in the taxonomy. This may include
    // some patterns that are not in the route table, such as the always-present root pattern '…', as
    // well as patterns synthesized at the intersection of overlapping patterns in the route table.
    var distinctPatterns = taxonomy.allPatterns;
    var patternIndices = distinctPatterns.reduce(function (map, pat, i) { return map.set(pat, i); }, new Map());
    // TODO: ... NB: clarify ordering of best rules (ie least to most specific)
    var equalBestRules = distinctPatterns.map(function (pattern) { return getEqualBestRulesForPattern(pattern, routeTable); });
    // TODO: doc...
    var alternateRoutes = distinctPatterns.map(function (pattern) { return taxonomy.allPathsFromHere
        .filter(function (path) { return path[path.length - 1] === pattern; })
        .map(function (path) { return path
        .map(function (pattern) { return equalBestRules[patternIndices.get(pattern)]; })
        .reduce(function (route, rules) { return route.concat(rules); }, [universalRule]); }); });
    // TODO: for each pattern, make a single best route. Ensure no possibility of ambiguity.
    var finalRoutes = distinctPatterns.map(function (pattern, i) { return getFinalRouteForPattern(pattern, alternateRoutes[i]); });
    // let finalRouteForEachPattern = distinctPatterns.reduce((map, pattern) => {
    //     let route = getFinalRouteForPattern(pattern, routesToEachPattern.get(pattern));
    //     return map.set(pattern, route);
    // }, new Map<Pattern, Route>());
    // TODO: make a route handler for each pattern.
    var routeHandlers = finalRoutes.map(make_route_handler_1.default);
    // let routes = distinctPatterns.reduce((map, pattern) => {
    //     let route = finalRouteForEachPattern.get(pattern);
    //     let routeHandler = makeRouteHandler(route);
    //     return map.set(pattern, routeHandler);
    // }, new Map<Pattern, Handler>());
    return routeHandlers.reduce(function (map, handler, i) { return map.set(distinctPatterns[i], handler); }, new Map());
    //return routes;
}
// TODO:  make jsdoc...
// Associate each distinct pattern (ie unique by signature) with the set of rules from the route table that *exactly* match
// it. Some patterns may have no such rules. Because:
// > // `taxonomy` may include some patterns that are not in the route table, such as the always-present root pattern '…', as
// > // well as patterns synthesized at the intersection of overlapping patterns in the route table.
// TODO: this next bit may be actually uneccessary? I think... Work it out...
// - definitely not needed at general end - universalRule is always added there.
// - at most specialized end? 
// In such cases we
// synthesize a single rule whose handler never handles the request. This makes subsequent logic
// simpler because it can assume there are 1..M rules for each distinct pattern.
// TODO: add comment about Rule order in result (using tiebreak function).
function getEqualBestRulesForPattern(pattern, routeTable) {
    // Compile the rule list for this pattern from the route table entries.
    var rules = Object.keys(routeTable)
        .map(function (key) { return new pattern_1.default(key); })
        .filter(function (pat) { return pat.normalized === pattern.normalized; })
        .map(function (pattern) { return ({ pattern: pattern, handler: normalize_handler_1.default(pattern, routeTable[pattern.toString()]) }); });
    // TODO: explain sort... all rules are equal by pattern signature, but we need specificity order.
    // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
    rules.sort(ruleComparator); // NB: may throw
    // TODO: ...
    return rules;
}
// TODO: doc...
function getFinalRouteForPattern(pattern, candidates) {
    // TODO: ... simple case... explain...
    if (candidates.length === 1) {
        return candidates[0];
    }
    // Find the longest common prefix and suffix of all the candidates.
    var prefix = util_2.getLongestCommonPrefix(candidates);
    var suffix = util_2.getLongestCommonPrefix(candidates.map(function (cand) { return cand.slice().reverse(); })).reverse(); // TODO: revise... inefficient copies...
    // TODO: possible for prefix and suffix to overlap? What to do?
    // Ensure the non-common parts contain NO decorators.
    candidates.forEach(function (cand) {
        var choppedRules = cand.slice(prefix.length, -suffix.length);
        if (choppedRules.every(function (rule) { return is_partial_handler_1.default(rule.handler); }))
            return;
        // TODO: improve error message/handling
        throw new Error("Multiple routes to '" + pattern + "' with different decorators");
    });
    // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
    var ambiguousFallbacks = candidates.map(function (cand) { return cand[cand.length - suffix.length - 1]; });
    var crasher = {
        pattern: pattern,
        handler: function crasher(request) {
            // TODO: improve error message/handling
            throw new Error("Multiple possible fallbacks from '" + pattern + ": " + ambiguousFallbacks.map(function (fn) { return fn.toString(); }));
        }
    };
    // final composite rule: splice of common prefix + crasher + common suffix
    var result = [].concat(prefix, crasher, suffix);
    return result;
}
// TODO: doc...
var nullHandler = function __nullHandler__(request) { return null; };
// TODO: doc...
var universalRule = { pattern: pattern_1.default.UNIVERSAL, handler: nullHandler };
// TODO: doc...
// TODO: improve error message/handling in here...
function ruleComparator(ruleA, ruleB) {
    var moreSpecificRule = tieBreakFn(ruleA, ruleB);
    assert(moreSpecificRule === ruleA || moreSpecificRule === ruleB, "ambiguous rules - which is more specific? A: " + util_1.inspect(ruleA) + ", B: " + util_1.inspect(ruleB)); // TODO: test/improve this message
    assert.strictEqual(moreSpecificRule, tieBreakFn(ruleB, ruleA)); // consistency check
    return moreSpecificRule === ruleA ? 1 : -1;
}
// TODO: this should be passed in or somehow provided from outside...
// TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
function tieBreakFn(a, b) {
    if (a.pattern.comment < b.pattern.comment)
        return a;
    if (b.pattern.comment < a.pattern.comment)
        return b;
}
//# sourceMappingURL=make-route-table-handler.js.map