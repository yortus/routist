'use strict';
var assert = require('assert');
var util_1 = require('util');
var util_2 = require('../util');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var is_partial_handler_1 = require('./is-partial-handler');
var make_dispatcher_1 = require('./make-dispatcher');
var make_pathway_handler_1 = require('./make-pathway-handler');
var normalize_handler_1 = require('./normalize-handler');
var pattern_1 = require('../patterns/pattern');
var walk_pattern_hierarchy_1 = require('./walk-pattern-hierarchy');
// TODO: doc...
function makeRouteTableHandler(routeTable) {
    // TODO: ...
    var patternHierarchy = hierarchize_patterns_1.default(Object.keys(routeTable).map(function (src) { return new pattern_1.default(src); }));
    // TODO: ...
    var pathwayHandlers = makeAllPathwayHandlers(patternHierarchy, routeTable);
    // TODO: ...
    var selectPathwayHandler = make_dispatcher_1.default(patternHierarchy, pathwayHandlers);
    // TODO: ...
    function __compiledRouteTable__(request) {
        var address = typeof request === 'string' ? request : request.address;
        var handlePathway = selectPathwayHandler(address);
        var response = handlePathway(request);
        return response;
    }
    ;
    return __compiledRouteTable__;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeRouteTableHandler;
// TODO:  make jsdoc...
// Associate each distinct pattern (ie unique by signature) with the set of rules from the route table that *exactly* match
// it. Some patterns may have no such rules. Because:
// > // patternHierarchy may include some patterns that are not in the route table, such as the always-present root pattern '…', as
// > // well as patterns synthesized at the intersection of overlapping patterns in the route table.
// TODO: this next bit may be actually uneccessary? I think... Work it out...
// - definitely not needed at general end - universalRule is always added there.
// - at most specialized end? 
// In such cases we
// synthesize a single rule whose handler never handles the request. This makes subsequent logic
// simpler because it can assume there are 1..M rules for each distinct pattern.
// TODO: add comment about Rule order in result (using tiebreak function).
function getEqualBestRulesForEachPattern(distinctPatterns, routeTable) {
    return distinctPatterns.reduce(function (allRulesSoFar, distinctPattern) {
        // Compile the rule list for this pattern from the route table entries.
        var equalBestRulesForPattern = Object.keys(routeTable)
            .map(function (key) { return new pattern_1.default(key); })
            .filter(function (pattern) { return pattern.normalized === distinctPattern; })
            .map(function (pattern) { return ({ pattern: pattern, handler: normalize_handler_1.default(pattern, routeTable[pattern.toString()]) }); });
        // TODO: explain sort... all rules are equal by pattern signature, but we need specificity order.
        // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
        equalBestRulesForPattern.sort(ruleComparator); // NB: may throw
        // TODO: remove? seems unneccessary...
        // // If the route table had no matching rules for this pattern, synthesize one now.
        // if (equalBestRulesForPattern.length === 0) {
        //     equalBestRulesForPattern.push({ pattern: distinctPattern, handler: nullHandler });
        // }
        // Update the map.
        allRulesSoFar.set(distinctPattern, equalBestRulesForPattern);
        return allRulesSoFar;
    }, new Map());
}
// TODO: ...
function makeAllPathwayHandlers(patternHierarchy, routeTable) {
    // Get a list of all the distinct patterns that occur in the pattern hierarchy. This may include
    // some patterns that are not in the route table, such as the always-present root pattern '…', as
    // well as patterns synthesized at the intersection of overlapping patterns in the route table.
    var distinctPatterns = util_2.getAllGraphNodes(patternHierarchy);
    // TODO: ... NB: clarify ordering of best rules (ie least to most specific)
    var bestRulesByPattern = getEqualBestRulesForEachPattern(distinctPatterns, routeTable);
    // TODO: for each pattern signature, get the list of rules that match, from least to most specific.
    // let ruleWalks = walkPatternHierarchy(patternHierarchy).map(pw => pw.reduce(
    //     (ruleWalk, pattern) => ruleWalk.concat(bestRulesForPattern.get(pattern)),
    //     [universalRule]
    // ));
    var ruleWalksByPattern = walk_pattern_hierarchy_1.default(patternHierarchy).reduce(function (ruleWalksSoFar, patternWalk) {
        // TODO: the key is the pattern of the last node in the walk
        var key = patternWalk[patternWalk.length - 1];
        // TODO: since we are walking a DAG, there may be multiple walks arriving at the same pattern.
        var ruleWalksForThisPattern = ruleWalksSoFar.get(key);
        if (!ruleWalksForThisPattern) {
            ruleWalksForThisPattern = [];
            ruleWalksSoFar.set(key, ruleWalksForThisPattern);
        }
        // TODO: create and add another rule walk for this pattern
        var value = patternWalk.reduce(function (ruleWalk, pattern) { return ruleWalk.concat(bestRulesByPattern.get(pattern)); }, [universalRule]);
        ruleWalksForThisPattern.push(value);
        // TODO: keep accumulating
        return ruleWalksSoFar;
    }, new Map());
    // TODO: for each pattern signature, get the ONE path or fail trying...
    var compositeRuleWalkByPattern = distinctPatterns.reduce(function (map, npat) {
        // TODO: ...
        var candidates = ruleWalksByPattern.get(npat);
        //was...
        // TODO: inefficient! review this...
        // let candidates = ruleWalks.filter(ruleWalk => {
        //     let lastRule = ruleWalk[ruleWalk.length - 1];
        //     return lastRule.pattern.normalized === npat.normalized;
        // });
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
    var routes = distinctPatterns.reduce(function (map, npat) {
        var ruleWalk = compositeRuleWalkByPattern.get(npat);
        var name = ruleWalk[ruleWalk.length - 1].pattern.toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat, make_pathway_handler_1.default(ruleWalk));
    }, new Map());
    return routes;
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