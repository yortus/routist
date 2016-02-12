'use strict';
var assert = require('assert');
var util_1 = require('util');
var util_2 = require('../util');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var is_partial_handler_1 = require('./is-partial-handler');
var make_dispatcher_1 = require('./make-dispatcher');
var make_router_1 = require('./make-router');
var normalize_handler_1 = require('./normalize-handler');
var pattern_1 = require('../patterns/pattern');
var walk_pattern_hierarchy_1 = require('./walk-pattern-hierarchy');
// TODO: doc...
function compile(routeTable) {
    var routes = test(routeTable); // TODO: fix terminology: 'handler' is taken...
    var patternHierarchy = hierarchize_patterns_1.default(Object.keys(routeTable).map(function (src) { return new pattern_1.default(src); }));
    var selectRoute = make_dispatcher_1.default(patternHierarchy, routes);
    function __compiledRouteTable__(request) {
        var address = typeof request === 'string' ? request : request.address;
        var route = selectRoute(address);
        var response = route(request);
        return response;
    }
    ;
    return __compiledRouteTable__;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compile;
// TODO: ...
function test(routeTable) {
    // Form a list of rules from the given route table. Each rule's handler is normalized.
    var rules = Object.keys(routeTable).map(function (patternSource) {
        var pattern = new pattern_1.default(patternSource);
        var handler = normalize_handler_1.default(pattern, routeTable[patternSource]);
        return { pattern: pattern, handler: handler };
    });
    // TODO: get pattern hierarchy... NB: will always be rooted at '…' even if no '…' rule exists
    var patternHierarchy = hierarchize_patterns_1.default(rules.map(function (rule) { return rule.pattern; }));
    var normalizedPatterns = util_2.getAllGraphNodes(patternHierarchy);
    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: add no-op rules as needed so that code below may assume there are 1..M rules for each signature.
    // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
    var rulesForPattern = normalizedPatterns.reduce(function (map, npat) {
        var equalBestRules = rules.filter(function (rule) { return rule.pattern.normalized === npat; });
        if (equalBestRules.length === 0) {
            equalBestRules.push({ pattern: npat, handler: nullHandler });
        }
        equalBestRules.sort(ruleComparator);
        return map.set(npat, equalBestRules);
    }, new Map());
    // TODO: for each pattern signature, get the list of rules that match, from least to most specific.
    var patternWalks = walk_pattern_hierarchy_1.default(patternHierarchy, function (path) { return path; });
    var ruleWalks = patternWalks.map(function (patternWalk) { return patternWalk.reduce(function (ruleWalk, pattern) { return ruleWalk.concat(rulesForPattern.get(pattern)); }, []); });
    // TODO: for each pattern signature, get the ONE path or fail trying...
    var ruleWalkForPattern = normalizedPatterns.reduce(function (map, npat) {
        // TODO: inefficient! review this...
        var candidates = ruleWalks.filter(function (ruleWalk) {
            var lastRule = ruleWalk[ruleWalk.length - 1];
            return lastRule.pattern.normalized === npat.normalized;
        });
        // TODO: ... simple case... explain...
        if (candidates.length === 1) {
            map.set(npat, candidates[0]);
            return map;
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
            throw new Error("Multiple routes to '" + npat + "' with different decorators");
        });
        // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
        var ambiguousFallbacks = candidates.map(function (cand) { return cand[cand.length - suffix.length - 1]; });
        var crasher = {
            pattern: npat,
            handler: function crasher(request) {
                // TODO: improve error message/handling
                throw new Error("Multiple possible fallbacks from '" + npat + ": " + ambiguousFallbacks.map(function (fn) { return fn.toString(); }));
            }
        };
        // final composite rule: splice of common prefix + crasher + common suffix
        map.set(npat, [].concat(prefix, crasher, suffix));
        return map;
    }, new Map());
    //console.log(handlerWalkForPattern);
    // reduce each signature's rule walk down to a simple handler function.
    var noMore = function (request) { return null; };
    var routes = normalizedPatterns.reduce(function (map, npat) {
        var ruleWalk = ruleWalkForPattern.get(npat);
        var name = ruleWalk[ruleWalk.length - 1].pattern.toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat, make_router_1.default(ruleWalk));
    }, new Map());
    return routes;
}
// TODO: doc...
var nullHandler = function (request) { return null; };
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
//# sourceMappingURL=compile.js.map