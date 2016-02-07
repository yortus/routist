'use strict';
var assert = require('assert');
var util_1 = require('../util');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
var route_1 = require('./route');
var rule_1 = require('./rule');
var walk_pattern_hierarchy_1 = require('./walk-pattern-hierarchy');
// TODO: ...
function test(routeTable) {
    // TODO: ...
    var rules = Object.keys(routeTable).map(function (ps) { return new rule_1.default(new pattern_1.default(ps), routeTable[ps]); });
    // // TODO: add special root rule...
    // // TODO: add it unconditionally and add tieBreak handler that always makes it the least specific rule
    var _404 = new rule_1.default(pattern_1.default.UNIVERSAL, function () { throw new Error('404!'); });
    rules.push(_404);
    // TODO: get pattern hierarchy...
    var patternHierarchy = hierarchize_patterns_1.default(rules.map(function (rule) { return rule.pattern; })); // TODO: review this line...
    var normalizedPatterns = util_1.getAllGraphNodes(patternHierarchy);
    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    var rulesForPattern = normalizedPatterns.reduce(function (map, npat) {
        map.set(npat, rules.filter(function (r) { return r.pattern.normalized === npat; }));
        return map;
    }, new Map());
    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    normalizedPatterns.forEach(function (npat) {
        var rules = rulesForPattern.get(npat);
        if (rules.length === 0) {
            rules.push(new rule_1.default(npat, noop));
        }
    });
    function noop() { return null; } // TODO: put elsewhere? Use Function.empty?
    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    normalizedPatterns.forEach(function (npat) {
        var rules = rulesForPattern.get(npat);
        rules.sort(function (a, b) {
            var moreSpecific = tieBreakFn(a, b);
            assert(moreSpecific === a || moreSpecific === b, "ambiguous rules - which is more specific? A: " + a + ", B: " + b);
            assert.strictEqual(moreSpecific, tieBreakFn(b, a)); // consistency check
            return moreSpecific === a ? 1 : -1;
        });
    });
    // TODO: this should be passed in or somehow provided from outside...
    // TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
    function tieBreakFn(a, b) {
        if (a === _404)
            return b;
        if (b === _404)
            return a;
        if (a.comment < b.comment)
            return a;
        if (b.comment < a.comment)
            return b;
    }
    // TODO: for each pattern signature, get the list of paths that lead to it
    var patternWalks = walk_pattern_hierarchy_1.default(patternHierarchy, function (path) { return path; });
    //console.log(patternWalks);
    // TODO: map from walks-of-patterns to walks-of-rules
    var ruleWalks = patternWalks.map(function (path) {
        var rulePath = [];
        for (var i = 0; i < path.length; ++i) {
            var rules_1 = rulesForPattern.get(path[i]);
            rulePath = rulePath.concat(rules_1);
        }
        return rulePath;
    });
    //console.log(ruleWalks);
    // TODO: for each pattern signature, get the ONE path or fail trying
    var ruleWalkForPattern = normalizedPatterns.reduce(function (map, npat) {
        var candidates = ruleWalks.filter(function (walk) { return walk[walk.length - 1].pattern.normalized === npat.normalized; }); // TODO: inefficient! review this...
        if (candidates.length === 1) {
            map.set(npat, candidates[0]);
            return map;
        }
        // find the longest common prefix of all the candidates.
        var prefixLength = 0;
        var _loop_1 = function() {
            if (candidates.some(function (cand) { return cand.length <= prefixLength; }))
                return "break";
            var el = candidates[0][prefixLength];
            if (!candidates.every(function (cand) { return cand[prefixLength] === el; }))
                return "break";
            ++prefixLength;
        };
        while (true) {
            var state_1 = _loop_1();
            if (state_1 === "break") break;
        }
        // find the longest common suffix of all the candidates.
        var suffixLength = 0;
        var _loop_2 = function() {
            if (candidates.some(function (cand) { return cand.length <= suffixLength; }))
                return "break";
            var el = candidates[0][candidates[0].length - 1 - suffixLength];
            if (!candidates.every(function (cand) { return cand[cand.length - 1 - suffixLength] === el; }))
                return "break";
            ++suffixLength;
        };
        while (true) {
            var state_2 = _loop_2();
            if (state_2 === "break") break;
        }
        // TODO: possible for prefix and suffix to overlap?
        // ensure the non-common parts contain NO decorator rules.
        candidates.forEach(function (cand) {
            var choppedRules = cand.slice(prefixLength, -suffixLength);
            if (choppedRules.every(function (rule) { return !rule.isDecorator; }))
                return;
            // TODO: improve error message/handling
            throw new Error("Multiple routes to '" + npat + "' with different decorators");
        });
        // synthesize a 'crasher' rule that throws an 'ambiguous' error.
        var fallbacks = candidates.map(function (cand) { return cand[cand.length - suffixLength - 1]; });
        var crasher = new rule_1.default(npat, function crasher() {
            // TODO: improve error message/handling
            throw new Error("Multiple possible fallbacks from '" + npat + ": " + fallbacks.map(function (r) { return r.toString(); }));
        });
        // final composite rule: splice of common prefix + crasher + common suffix
        var commonPrefix = candidates[0].slice(0, prefixLength);
        var commonSuffix = candidates[0].slice(-suffixLength);
        map.set(npat, [].concat(commonPrefix, crasher, commonSuffix));
        return map;
    }, new Map());
    //console.log(ruleWalkForPattern);
    // reduce each signature's rule walk down to a simple handler function.
    var noMore = function (rq) { return null; };
    var routes = normalizedPatterns.reduce(function (map, npat) {
        return map.set(npat, new route_1.default(ruleWalkForPattern.get(npat)));
    }, new Map());
    return routes;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = test;
//# sourceMappingURL=router2.js.map