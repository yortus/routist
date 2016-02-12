'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import {Graph, getAllGraphNodes, getLongestCommonPrefix} from '../util';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import isPartialHandler from './is-partial-handler';
import makeDispatcher from './make-dispatcher';
import makePathwayHandler from './make-pathway-handler';
import normalizeHandler from './normalize-handler';
import Pattern from '../patterns/pattern';
import Request from '../request';
import {RouteTable, Handler, Rule} from './types';
import walkPatternHierarchy from './walk-pattern-hierarchy';





// TODO: doc...
export default function makeRouteTableHandler(routeTable: {[pattern: string]: Function}) {

    // TODO: ...
    let patternHierarchy = hierarchizePatterns(Object.keys(routeTable).map(src => new Pattern(src)));

    // TODO: ...
    let pathwayHandlers = makeAllPathwayHandlers(patternHierarchy, routeTable);

    // TODO: ...
    let selectPathwayHandler = makeDispatcher(patternHierarchy, pathwayHandlers);

    // TODO: ...
    function __compiledRouteTable__(request: Request) {
        let address = typeof request === 'string' ? request : request.address;
        let handlePathway = selectPathwayHandler(address);
        let response = handlePathway(request);
        return response;
    };

    return __compiledRouteTable__;
}





// TODO:  make jsdoc...
// Associate each distinct pattern (ie unique by signature) with the set of rules from the route table that *exactly* match
// it. Some patterns may have no such rules. Because:
// > // patternHierarchy may include some patterns that are not in the route table, such as the always-present root pattern '…', as
// > // well as patterns synthesized at the intersection of overlapping patterns in the route table.
// In such cases we
// synthesize a single rule whose handler never handles the request. This makes subsequent logic
// simpler because it can assume there are 1..M rules for each distinct pattern.
// TODO: add comment about Rule order in result (using tiebreak function).
function getEqualBestRulesForEachDistinctPattern(distinctPatterns: Pattern[], routeTable: RouteTable): Map<Pattern, Rule[]> {
    return distinctPatterns.reduce(
        (allRulesSoFar, distinctPattern) => {

            // Compile the rule list for this pattern from the route table entries.
            let equalBestRulesForPattern = Object.keys(routeTable)
                .map(key => new Pattern(key))
                .filter(pattern => pattern.normalized === distinctPattern)
                .map<Rule>(pattern => ({ pattern, handler: normalizeHandler(pattern, routeTable[pattern.toString()]) }));

            // TODO: explain sort... all rules are equal by pattern signature, but we need specificity order.
            // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
            equalBestRulesForPattern.sort(ruleComparator); // NB: may throw

            // If the route table had no matching rules for this pattern, synthesize one now.
            if (equalBestRulesForPattern.length === 0) {
                equalBestRulesForPattern.push({ pattern: distinctPattern, handler: nullHandler });
            }

            // Update the map.
            allRulesSoFar.set(distinctPattern, equalBestRulesForPattern);
            return allRulesSoFar;
        },
        new Map<Pattern, Rule[]>()
    );
}





// TODO: ...
function makeAllPathwayHandlers(patternHierarchy: Graph<Pattern>, routeTable: RouteTable): Map<Pattern, Handler> {

    // Get a list of all the distinct patterns that occur in the pattern hierarchy. This may include
    // some patterns that are not in the route table, such as the always-present root pattern '…', as
    // well as patterns synthesized at the intersection of overlapping patterns in the route table.
    let distinctPatterns = getAllGraphNodes(patternHierarchy);


    // TODO: ...
    let allRules = getEqualBestRulesForEachDistinctPattern(distinctPatterns, routeTable);


    // TODO: ...
    let patternWalks = walkPatternHierarchy(patternHierarchy, path => path);


    // TODO: ...
//     let x = Array.from(allRules.entries()).forEach(([pattern, rules]) => {
// 
//         // TODO: get all pattern walks ending at the desired pattern.
//         let y = patternWalks.filter(pw => pw[pw.length - 1] === pattern);
// 
// 
// 
//                 
// 
// 
//     });

    // TODO: doc...
    let rulesForPattern = allRules;
        




    // TODO: for each pattern signature, get the list of rules that match, from least to most specific.
    let ruleWalks = patternWalks.map(pw => pw.reduce(
        (ruleWalk, pattern) => ruleWalk.concat(rulesForPattern.get(pattern)),
        <Rule[]>[]
    ));

    // TODO: for each pattern signature, get the ONE path or fail trying...
    let ruleWalkForPattern = distinctPatterns.reduce((map, npat) => {

        // TODO: inefficient! review this...
        let candidates = ruleWalks.filter(ruleWalk => {
            let lastRule = ruleWalk[ruleWalk.length - 1];
            return lastRule.pattern.normalized === npat.normalized;
        });

        // TODO: ... simple case... explain...
        if (candidates.length === 1) {
            map.set(npat, candidates[0]);
            return map;
        }

        // Find the longest common prefix and suffix of all the candidates.
        let prefix = getLongestCommonPrefix(candidates);
        let suffix = getLongestCommonPrefix(candidates.map(cand => cand.slice().reverse())).reverse(); // TODO: revise... inefficient copies...

        // TODO: possible for prefix and suffix to overlap? What to do?

        // Ensure the non-common parts contain NO decorators.
        candidates.forEach(cand => {
            let choppedRules = cand.slice(prefix.length, -suffix.length);
            if (choppedRules.every(rule => isPartialHandler(rule.handler))) return;
            // TODO: improve error message/handling
            throw new Error(`Multiple routes to '${npat}' with different decorators`);
        });

        // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
        let ambiguousFallbacks = candidates.map(cand => cand[cand.length - suffix.length - 1]);
        let crasher: Rule = {
            pattern: npat,
            handler: function crasher(request): any {
                // TODO: improve error message/handling
                throw new Error(`Multiple possible fallbacks from '${npat}: ${ambiguousFallbacks.map(fn => fn.toString())}`);
            }
        };

        // final composite rule: splice of common prefix + crasher + common suffix
        map.set(npat, [].concat(prefix, crasher, suffix));
        return map;
    }, new Map<Pattern, Rule[]>());
//console.log(handlerWalkForPattern);


    // reduce each signature's rule walk down to a simple handler function.
    const noMore: Handler = request => null;
    let routes = distinctPatterns.reduce((map, npat) => {
        let ruleWalk = ruleWalkForPattern.get(npat);
        let name = ruleWalk[ruleWalk.length - 1].pattern.toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat, makePathwayHandler(ruleWalk));
    }, new Map<Pattern, Handler>());

    return routes;
}





// TODO: doc...
const nullHandler: Handler = function __nullHandler__(request) { return null; };





// TODO: doc...
// TODO: improve error message/handling in here...
function ruleComparator(ruleA, ruleB) {
    let moreSpecificRule = tieBreakFn(ruleA, ruleB);
    assert(moreSpecificRule === ruleA || moreSpecificRule === ruleB, `ambiguous rules - which is more specific? A: ${inspect(ruleA)}, B: ${inspect(ruleB)}`); // TODO: test/improve this message
    assert.strictEqual(moreSpecificRule, tieBreakFn(ruleB, ruleA)); // consistency check
    return moreSpecificRule === ruleA ? 1 : -1;
}





// TODO: this should be passed in or somehow provided from outside...
// TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
function tieBreakFn(a: Rule, b: Rule): Rule {
    if (a.pattern.comment < b.pattern.comment) return a;
    if (b.pattern.comment < a.pattern.comment) return b;
}
