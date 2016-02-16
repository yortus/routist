'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import getAllGraphNodes from '../taxonomy/get-all-graph-nodes';
import {getLongestCommonPrefix} from '../util';
import {Handler, Route, RouteTable, Rule} from './types';
import makeTaxonomy, {Taxonomy} from '../taxonomy/make-taxonomy';
import isPartialHandler from './is-partial-handler';
import makeDispatcher from './make-dispatcher';
import makePathwayHandler from './make-pathway-handler';
import normalizeHandler from './normalize-handler';
import Pattern from '../patterns/pattern';
import Request from '../request';
import walkTaxonomy from '../taxonomy/walk-taxonomy';





// TODO: doc...
export default function makeRouteTableHandler(routeTable: {[pattern: string]: Function}) {

    // TODO: ...
    let taxonomy = makeTaxonomy(Object.keys(routeTable).map(src => new Pattern(src)));

    // TODO: ...
    let pathwayHandlers = makeAllPathwayHandlers(taxonomy, routeTable);

    // TODO: ...
    let selectPathwayHandler = makeDispatcher(taxonomy, pathwayHandlers);

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
// > // `taxonomy` may include some patterns that are not in the route table, such as the always-present root pattern '…', as
// > // well as patterns synthesized at the intersection of overlapping patterns in the route table.

// TODO: this next bit may be actually uneccessary? I think... Work it out...
// - definitely not needed at general end - universalRule is always added there.
// - at most specialized end? 
// In such cases we
// synthesize a single rule whose handler never handles the request. This makes subsequent logic
// simpler because it can assume there are 1..M rules for each distinct pattern.
// TODO: add comment about Rule order in result (using tiebreak function).
function getEqualBestRulesForPattern(normalizedPattern: Pattern, routeTable: RouteTable): Rule[] {

    // Compile the rule list for this pattern from the route table entries.
    let rules = Object.keys(routeTable)
        .map(key => new Pattern(key))
        .filter(pattern => pattern.normalized === normalizedPattern)
        .map<Rule>(pattern => ({ pattern, handler: normalizeHandler(pattern, routeTable[pattern.toString()]) }));

    // TODO: explain sort... all rules are equal by pattern signature, but we need specificity order.
    // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
    rules.sort(ruleComparator); // NB: may throw

    // TODO: ...
    return rules;
}





// TODO: doc...
function getAllRoutesToPattern(normalizedPattern: Pattern, bestRulesByPattern: Map<Pattern, Rule[]>): Route[] {
    // TODO: ...
    throw 1;


    
}




// TODO: ...
function makeAllPathwayHandlers(taxonomy: Taxonomy, routeTable: RouteTable): Map<Pattern, Handler> {

    // Get a list of all the distinct patterns that occur in the taxonomy. This may include
    // some patterns that are not in the route table, such as the always-present root pattern '…', as
    // well as patterns synthesized at the intersection of overlapping patterns in the route table.
    let distinctPatterns = getAllGraphNodes(taxonomy);


    // TODO: ... NB: clarify ordering of best rules (ie least to most specific)
    let bestRulesByPattern = distinctPatterns.reduce(
        (map, node) => map.set(node.pattern, getEqualBestRulesForPattern(node.pattern, routeTable)),
        new Map<Pattern, Rule[]>()
    );

        



    let ruleWalksByPattern = walkTaxonomy(taxonomy).reduce(
        (ruleWalksSoFar, patternWalk) => {

            // TODO: the key is the pattern of the last node in the walk
            let key = patternWalk[patternWalk.length - 1];

            // TODO: since we are walking a DAG, there may be multiple walks arriving at the same pattern.
            let ruleWalksForThisPattern = ruleWalksSoFar.get(key);
            if (!ruleWalksForThisPattern) {
                ruleWalksForThisPattern = [];
                ruleWalksSoFar.set(key, ruleWalksForThisPattern);
            }

            // TODO: create and add another rule walk for this pattern
            let value = patternWalk.reduce(
                (ruleWalk, pattern) => ruleWalk.concat(bestRulesByPattern.get(pattern)),
                [universalRule]
            );
            ruleWalksForThisPattern.push(value);

            // TODO: keep accumulating
            return ruleWalksSoFar;
        },
        new Map<Pattern, Rule[][]>()
    );








    // TODO: for each pattern signature, get the ONE path or fail trying...
    let compositeRuleWalkByPattern = distinctPatterns.reduce((map, npat) => {

        // TODO: ...
        let candidates = ruleWalksByPattern.get(npat.pattern);
        //was...
        // TODO: inefficient! review this...
        // let candidates = ruleWalks.filter(ruleWalk => {
        //     let lastRule = ruleWalk[ruleWalk.length - 1];
        //     return lastRule.pattern.normalized === npat.normalized;
        // });

        // TODO: ... simple case... explain...
        if (candidates.length === 1) {
            map.set(npat.pattern, candidates[0]);
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
            pattern: npat.pattern,
            handler: function crasher(request): any {
                // TODO: improve error message/handling
                throw new Error(`Multiple possible fallbacks from '${npat}: ${ambiguousFallbacks.map(fn => fn.toString())}`);
            }
        };

        // final composite rule: splice of common prefix + crasher + common suffix
        map.set(npat.pattern, [].concat(prefix, crasher, suffix));
        return map;
    }, new Map<Pattern, Rule[]>());
//console.log(handlerWalkForPattern);


    // reduce each signature's rule walk down to a simple handler function.
    const noMore: Handler = request => null;
    let routes = distinctPatterns.reduce((map, npat) => {
        let ruleWalk = compositeRuleWalkByPattern.get(npat.pattern);
        let name = ruleWalk[ruleWalk.length - 1].pattern.toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat.pattern, makePathwayHandler(ruleWalk));
    }, new Map<Pattern, Handler>());

    return routes;
}





// TODO: doc...
const nullHandler: Handler = function __nullHandler__(request) { return null; };





// TODO: doc...
const universalRule: Rule = { pattern: Pattern.UNIVERSAL, handler: nullHandler };





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
