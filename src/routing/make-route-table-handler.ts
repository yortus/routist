'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import {getLongestCommonPrefix} from '../util';
import {Handler, Route, RouteTable, Rule} from './types';
import Taxonomy from '../taxonomy';
import isPartialHandler from './is-partial-handler';
import makeDispatcher from './make-dispatcher';
import makeRouteHandler from './make-route-handler';
import normalizeHandler from './normalize-handler';
import Pattern from '../pattern';
import Request from '../request';





// TODO: doc...
export default function makeRouteTableHandler(routeTable: {[pattern: string]: Function}): Handler {

    // TODO: ...
    let taxonomy = Taxonomy.from(Object.keys(routeTable).map(src => new Pattern(src)));

    // TODO: ...
    let routeHandlers = makeAllRouteHandlers(taxonomy, routeTable);

    // TODO: ...
    let selectRouteHandler = makeDispatcher(taxonomy, routeHandlers);

    // TODO: ...
    function __compiledRouteTable__(request: Request) {
        let address = typeof request === 'string' ? request : request.address;
        let handleRoute = selectRouteHandler(address);
        let response = handleRoute(request);
        return response;
    };

    return __compiledRouteTable__;
}




// TODO: ...
function makeAllRouteHandlers(taxonomy: Taxonomy, routeTable: RouteTable): Map<Pattern, Handler> {

    // Get a list of all the distinct patterns that occur in the taxonomy. This may include
    // some patterns that are not in the route table, such as the always-present root pattern '…', as
    // well as patterns synthesized at the intersection of overlapping patterns in the route table.
    let distinctPatterns = taxonomy.allPatterns;


    // TODO: ... NB: clarify ordering of best rules (ie least to most specific)
    let bestRulesForEachPattern = distinctPatterns.reduce(
        (map, pattern) => map.set(pattern, getEqualBestRulesForPattern(pattern, routeTable)),
        new Map<Pattern, Rule[]>()
    );


    // TODO: doc...
    let routesToEachPattern = getRoutesToEachPattern(taxonomy, bestRulesForEachPattern);


    // TODO: for each pattern, make a single best route. Ensure no possibility of ambiguity.
    let finalRouteForEachPattern = distinctPatterns.reduce((map, pattern) => {
        let route = getFinalRouteForPattern(pattern, routesToEachPattern.get(pattern));
        return map.set(pattern, route);
    }, new Map<Pattern, Route>());


    // TODO: make a route handler for each pattern.
    let routes = distinctPatterns.reduce((map, pattern) => {
        let route = finalRouteForEachPattern.get(pattern);
        let routeHandler = makeRouteHandler(route);
        return map.set(pattern, routeHandler);
    }, new Map<Pattern, Handler>());

    return routes;
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
function getEqualBestRulesForPattern(pattern: Pattern, routeTable: RouteTable): Rule[] {

    // Compile the rule list for this pattern from the route table entries.
    let rules = Object.keys(routeTable)
        .map(key => new Pattern(key))
        .filter(pat => pat.normalized === pattern.normalized)
        .map<Rule>(pattern => ({ pattern, handler: normalizeHandler(pattern, routeTable[pattern.toString()]) }));

    // TODO: explain sort... all rules are equal by pattern signature, but we need specificity order.
    // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
    rules.sort(ruleComparator); // NB: may throw

    // TODO: ...
    return rules;
}





// TODO: doc...
function getRoutesToEachPattern(taxonomy: Taxonomy, bestRulesForEachPattern: Map<Pattern, Rule[]>): Map<Pattern, Route[]> {

    let result = taxonomy.allPathsFromHere.reduce(
        (routesToEachPattern, path) => {

            // TODO: the key is the pattern of the last node in the path. WTF? Clarify comment...
            let key = path[path.length - 1];

            // TODO: since we are walking a DAG, there may be multiple paths arriving at the same pattern.
            let routesToThisPattern = routesToEachPattern.get(key);
            if (!routesToThisPattern) {
                routesToThisPattern = [];
                routesToEachPattern.set(key, routesToThisPattern);
            }

            // TODO: create and add another route to this pattern
            let anotherRoute = path.reduce(
                (route, pattern) => route.concat(bestRulesForEachPattern.get(pattern)),
                <Route>[universalRule]
            );
            routesToThisPattern.push(anotherRoute);

            // TODO: keep accumulating
            return routesToEachPattern;
        },
        new Map<Pattern, Route[]>()
    );
    return result;
}





// TODO: doc...
function getFinalRouteForPattern(pattern: Pattern, candidates: Route[]) {

    // TODO: ... simple case... explain...
    if (candidates.length === 1) {
        return candidates[0];
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
        throw new Error(`Multiple routes to '${pattern}' with different decorators`);
    });

    // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
    let ambiguousFallbacks = candidates.map(cand => cand[cand.length - suffix.length - 1]);
    let crasher: Rule = {
        pattern,
        handler: function crasher(request): any {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${pattern}: ${ambiguousFallbacks.map(fn => fn.toString())}`);
        }
    };

    // final composite rule: splice of common prefix + crasher + common suffix
    let result = [].concat(prefix, crasher, suffix);
    return result;
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
