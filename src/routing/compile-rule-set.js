'use strict';
var assert = require('assert');
var util_1 = require('util');
var util_2 = require('../util');
var make_dispatcher_1 = require('./make-dispatcher');
var make_route_handler_1 = require('./make-route-handler');
var pattern_1 = require('../pattern');
var rule_1 = require('./rule');
var taxonomy_1 = require('../taxonomy');
// TODO: doc...
function compileRuleSet(ruleSet) {
    // Generate a taxonomic arrangement of all the patterns that occur in the ruleset.
    var taxonomy = new taxonomy_1.default(Object.keys(ruleSet).map(function (src) { return new pattern_1.default(src); }));
    // Find all functionally-distinct routes that an address can take through the ruleset.
    var routes = findAllRoutesThroughRuleSet(taxonomy, ruleSet);
    // Create a handler for each distinct route through the ruleset.
    var routeHandlers = Array.from(routes.keys()).reduce(function (map, pattern) { return map.set(pattern, make_route_handler_1.default(routes.get(pattern))); }, new Map());
    // Generate a function that, given an address, returns the handler for the best-matching route.
    var selectRouteHandler = make_dispatcher_1.default(taxonomy, routeHandlers);
    // TODO: ...
    return function __compiledRuleSet__(address, request) {
        var handleRoute = selectRouteHandler(address);
        var response = handleRoute(address, request);
        return response;
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compileRuleSet;
// TODO: ...
function findAllRoutesThroughRuleSet(taxonomy, ruleSet) {
    // TODO: ... NB: clarify ordering of best rules (ie least to most specific)
    var equalBestRules = taxonomy.allNodes.reduce(function (map, node) { return map.set(node.pattern, getEqualBestRulesForPattern(node.pattern, ruleSet)); }, new Map());
    // TODO: doc...
    return taxonomy.allNodes.reduce(function (map, node) {
        // TODO: doc...
        var alternateRoutes = getAllPathsFromRootToHere(node)
            .map(function (path) { return path
            .map(function (pattern) { return equalBestRules.get(pattern); })
            .reduce(function (route, rules) { return route.concat(rules); }, [universalRule]); });
        // TODO: make a single best route. Ensure no possibility of ambiguity.
        var singleRoute = reduceToSingleRoute(node.pattern, alternateRoutes);
        return map.set(node.pattern, singleRoute);
    }, new Map());
}
// TODO:  make jsdoc...
// Associate each distinct pattern (ie unique by signature) with the set of rules from the ruleset that *exactly* match
// it. Some patterns may have no such rules. Because:
// > // `taxonomy` may include some patterns that are not in the ruleset, such as the always-present root pattern '…', as
// > // well as patterns synthesized at the intersection of overlapping patterns in the ruleset.
// TODO: add comment about Rule order in result (using tiebreak function).
function getEqualBestRulesForPattern(pattern, ruleSet) {
    // Compile the rule list for this pattern from the ruleset entries.
    var rules = Object.keys(ruleSet)
        .map(function (key) { return new pattern_1.default(key); })
        .filter(function (pat) { return pat.normalized === pattern.normalized; })
        .map(function (pat) { return pat.toString(); })
        .map(function (key) { return new rule_1.default(key, ruleSet[key]); });
    //TODO:...was...remove?... .map<Rule>(pat => ({ pattern: pat, handler: normalizeHandler(pat, ruleSet[pat.toString()]) }));
    // TODO: explain sort... all rules are equal by pattern signature, but we need an unambiguous ordering.
    // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
    rules.sort(ruleComparator); // NB: may throw
    // TODO: ...
    return rules;
}
// TODO: review doc...
// TODO: badly named...
/**
 * Enumerates every possible walk[1] in the `taxonomy` DAG that begins at the this Pattern
 * and ends at any Pattern reachable from the this one. Each walk is a Pattern array,
 * whose elements are arranged in walk-order (i.e., from the root to the descendent).
 * [1] See: https://en.wikipedia.org/wiki/Glossary_of_graph_theory#Walks
 * @param {Taxonomy} taxonomy - the pattern DAG to be walked.
 * TODO: fix below....
 * @returns
 */
function getAllPathsFromRootToHere(node) {
    // TODO: test/review/cleanup...
    var allPaths = (_a = []).concat.apply(_a, node.generalizations.map(getAllPathsFromRootToHere));
    if (allPaths.length === 0)
        allPaths = [[]]; // no parent paths - this must be the root
    return allPaths.map(function (path) { return path.concat([node.pattern]); });
    var _a;
}
// TODO: doc...
function reduceToSingleRoute(pattern, candidates) {
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
        if (choppedRules.every(function (rule) { return !rule.isDecorator; }))
            return;
        // TODO: improve error message/handling
        throw new Error("Multiple routes to '" + pattern + "' with different decorators");
    });
    // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
    var ambiguousFallbacks = candidates.map(function (cand) { return cand[cand.length - suffix.length - 1]; });
    var crasher = new rule_1.default(pattern.toString(), function crasher() {
        // TODO: improve error message/handling
        throw new Error("Multiple possible fallbacks from '" + pattern + ": " + ambiguousFallbacks.map(function (fn) { return fn.toString(); }));
    });
    // final composite rule: splice of common prefix + crasher + common suffix
    var result = [].concat(prefix, crasher, suffix);
    return result;
}
// TODO: doc...
var nullHandler = function __nullHandler__() { return null; };
// TODO: doc...
var universalRule = new rule_1.default(pattern_1.default.UNIVERSAL.toString(), nullHandler);
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
    // TODO: is '<' reliable here for string comparisons? What compare fn does it map to? Locale? Case?
    if (a.pattern.comment < b.pattern.comment)
        return a;
    if (b.pattern.comment < a.pattern.comment)
        return b;
    // TODO: all else being equal, partial handler is always more specific than general handler on the same pattern...
    if (!a.isDecorator && b.isDecorator)
        return a;
    if (!b.isDecorator && a.isDecorator)
        return b;
}
//# sourceMappingURL=compile-rule-set.js.map