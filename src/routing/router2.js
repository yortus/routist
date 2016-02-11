'use strict';
var assert = require('assert');
var util_1 = require('util');
var util_2 = require('../util');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var is_decorator_1 = require('./is-decorator');
var make_normalized_handler_function_1 = require('./make-normalized-handler-function');
var pattern_1 = require('../patterns/pattern');
var route_1 = require('./route');
var walk_pattern_hierarchy_1 = require('./walk-pattern-hierarchy');
// TODO: ...
function test(routeTable) {
    // TODO: ...
    var rules = Object.keys(routeTable).map(function (patternSource) {
        var pattern = new pattern_1.default(patternSource);
        var handler = make_normalized_handler_function_1.default(pattern, routeTable[patternSource]);
        return { pattern: pattern, handler: handler };
    });
    // TODO: add special universal fallback rule...
    rules.push(universalRule);
    // TODO: get pattern hierarchy...
    var patternHierarchy = hierarchize_patterns_1.default(rules.map(function (rule) { return rule.pattern; }));
    var normalizedPatterns = util_2.getAllGraphNodes(patternHierarchy);
    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    var rulesForPattern = normalizedPatterns.reduce(function (map, npat) {
        map.set(npat, rules.filter(function (rule) { return rule.pattern.normalized === npat; }));
        return map;
    }, new Map());
    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    normalizedPatterns.forEach(function (npat) {
        var candidates = rulesForPattern.get(npat);
        if (candidates.length > 0)
            return;
        candidates.push({ pattern: npat, handler: noop });
    });
    function noop() { return null; } // TODO: put elsewhere? Use Function.empty?
    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    normalizedPatterns.forEach(function (npat) {
        var candidates = rulesForPattern.get(npat);
        candidates.sort(function (ruleA, ruleB) {
            var moreSpecificRule = tieBreakFn(ruleA, ruleB);
            assert(moreSpecificRule === ruleA || moreSpecificRule === ruleB, "ambiguous rules - which is more specific? A: " + util_1.inspect(ruleA) + ", B: " + util_1.inspect(ruleB)); // TODO: test/improve this message
            assert.strictEqual(moreSpecificRule, tieBreakFn(ruleB, ruleA)); // consistency check
            return moreSpecificRule === ruleA ? 1 : -1;
        });
    });
    // TODO: for each pattern signature, get the list of paths through the pattern hierarchy that lead to it
    var patternWalks = walk_pattern_hierarchy_1.default(patternHierarchy, function (path) { return path; });
    //console.log(patternWalks);
    // TODO: map from walks-of-patterns to walks-of-rules
    var ruleWalks = patternWalks.map(function (patternWalk) { return patternWalk.reduce(function (ruleWalk, pattern) { return ruleWalk.concat(rulesForPattern.get(pattern)); }, []); });
    //console.log(ruleWalks);
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
            if (choppedRules.every(function (rule) { return !is_decorator_1.default(rule.handler); }))
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
    var noMore = function (rq) { return null; };
    var routes = normalizedPatterns.reduce(function (map, npat) {
        var ruleWalk = ruleWalkForPattern.get(npat);
        var name = ruleWalk[ruleWalk.length - 1].pattern.toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat, new route_1.default(name, ruleWalk.map(function (rule) { return rule.handler; })));
    }, new Map());
    return routes;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = test;
// TODO: what should the universal handler really do? Must not be transport-specific.
var universalRule = {
    pattern: pattern_1.default.UNIVERSAL,
    handler: function (request) { throw new Error('404!'); }
};
// TODO: this should be passed in or somehow provided from outside...
// TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
// TODO: universalHandler must ALWAYS be the least specific rule
function tieBreakFn(a, b) {
    if (a === universalRule)
        return b;
    if (b === universalRule)
        return a;
    if (a.pattern.comment < b.pattern.comment)
        return a;
    if (b.pattern.comment < a.pattern.comment)
        return b;
}
//# sourceMappingURL=router2.js.map