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
    var patterns = Object.keys(routeTable).map(function (patternSource) { return new pattern_1.default(patternSource); });
    var handlers = patterns.map(function (pattern) { return make_normalized_handler_function_1.default(pattern, routeTable[pattern.toString()]); });
    // TODO: add special universal fallback rule...
    patterns.push(pattern_1.default.UNIVERSAL);
    handlers.push(universalHandler);
    // TODO: get pattern hierarchy...
    var patternHierarchy = hierarchize_patterns_1.default(patterns);
    var normalizedPatterns = util_2.getAllGraphNodes(patternHierarchy);
    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    var handlersForPattern = normalizedPatterns.reduce(function (map, npat) {
        //TODO: bug here... temp testing...
        //debugger;
        var hs = handlers.filter(function (_, i) { return patterns[i].normalized === npat; });
        map.set(npat, handlers.filter(function (_, i) { return patterns[i].normalized === npat; }));
        return map;
    }, new Map());
    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    normalizedPatterns.forEach(function (npat) {
        var candidates = handlersForPattern.get(npat);
        if (candidates.length > 0)
            return;
        candidates.push((function noop() { return null; }));
        patterns.push(npat);
        handlers.push(candidates[0]);
        // TODO: was... restore use of reuseable noop handler... handlers.push(noop);
    });
    //TODO: was... restore... see above... function noop() { return null; } // TODO: put elsewhere? Use Function.empty?
    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    normalizedPatterns.forEach(function (npat) {
        var candidates = handlersForPattern.get(npat);
        candidates.sort(function (handlerA, handlerB) {
            var ruleA = { pattern: patterns[handlers.indexOf(handlerA)], handler: handlerA };
            var ruleB = { pattern: patterns[handlers.indexOf(handlerB)], handler: handlerB };
            var moreSpecificRule = tieBreakFn(ruleA, ruleB);
            assert(moreSpecificRule === ruleA || moreSpecificRule === ruleB, "ambiguous rules - which is more specific? A: " + util_1.inspect(ruleA) + ", B: " + util_1.inspect(ruleB)); // TODO: test/improve this message
            assert.strictEqual(moreSpecificRule, tieBreakFn(ruleB, ruleA)); // consistency check
            return moreSpecificRule === ruleA ? 1 : -1;
        });
    });
    // TODO: for each pattern signature, get the list of paths through the pattern hierarchy that lead to it
    var patternWalks = walk_pattern_hierarchy_1.default(patternHierarchy, function (path) { return path; });
    //console.log(patternWalks);
    debugger;
    // TODO: map from walks-of-patterns to walks-of-rules
    var handlerWalks = patternWalks.map(function (patternWalk) { return patternWalk.reduce(function (handlerWalk, pattern) { return handlerWalk.concat(handlersForPattern.get(pattern)); }, []); });
    console.log(handlerWalks);
    // TODO: for each pattern signature, get the ONE path or fail trying...
    var handlerWalkForPattern = normalizedPatterns.reduce(function (map, npat) {
        // TODO: inefficient! review this...
        var candidates = handlerWalks.filter(function (handlerWalk) {
            var finalHandler = handlerWalk[handlerWalk.length - 1];
            if (handlers.indexOf(finalHandler) === -1) {
                debugger;
            }
            var finalPattern = patterns[handlers.indexOf(finalHandler)];
            return finalPattern.normalized === npat.normalized;
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
            var choppedHandlers = cand.slice(prefix.length, -suffix.length);
            if (choppedHandlers.every(function (handler) { return !is_decorator_1.default(handler); }))
                return;
            // TODO: improve error message/handling
            throw new Error("Multiple routes to '" + npat + "' with different decorators");
        });
        // Synthesize a 'crasher' handler that throws an 'ambiguous' error.
        var ambiguousFallbacks = candidates.map(function (cand) { return cand[cand.length - suffix.length - 1]; });
        var crasher = function crasher(request) {
            // TODO: improve error message/handling
            throw new Error("Multiple possible fallbacks from '" + npat + ": " + ambiguousFallbacks.map(function (fn) { return fn.toString(); }));
        };
        // final composite rule: splice of common prefix + crasher + common suffix
        map.set(npat, [].concat(prefix, crasher, suffix));
        return map;
    }, new Map());
    //console.log(handlerWalkForPattern);
    // reduce each signature's handler walk down to a simple handler function.
    var noMore = function (rq) { return null; };
    var routes = normalizedPatterns.reduce(function (map, npat) {
        var handlerWalk = handlerWalkForPattern.get(npat);
        var name = patterns[handlers.indexOf(handlerWalk[handlerWalk.length - 1])].toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat, new route_1.default(name, handlerWalk));
    }, new Map());
    return routes;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = test;
// TODO: what should the universal handler really do? Must not be transport-specific.
var universalHandler = (function (request) { throw new Error('404!'); });
universalHandler.pattern = pattern_1.default.UNIVERSAL;
universalHandler.isDecorator = false;
function tieBreakFn(a, b) {
    if (a.handler === universalHandler)
        return b;
    if (b.handler === universalHandler)
        return a;
    if (a.pattern.comment < b.pattern.comment)
        return a;
    if (b.pattern.comment < a.pattern.comment)
        return b;
}
//# sourceMappingURL=router2.js.map