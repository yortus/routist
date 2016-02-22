'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import {getLongestCommonPrefix} from '../util';
import {Handler, Route, Rule, RuleSet} from './types';
import Taxonomy, {TaxonomyNode} from '../taxonomy';
import isPartialHandler from './is-partial-handler';
import makeDispatcher from './make-dispatcher';
import makeRouteHandler from './make-route-handler';
import normalizeHandler from './normalize-handler';
import Pattern from '../pattern';
import Request from '../request';





// TODO: doc...
export default function compileRuleSet(ruleSet: RuleSet): Handler {

    // Generate a taxonomic arrangement of all the patterns that occur in the ruleset.
    let taxonomy = new Taxonomy(Object.keys(ruleSet).map(src => new Pattern(src)));

    // Find all functionally-distinct routes that an address can take through the ruleset.
    let routes = findAllRoutesThroughRuleSet(taxonomy, ruleSet);

    // Create a handler for each distinct route through the ruleset.
    let routeHandlers = Array.from(routes.keys()).reduce(
        (map, pattern) => map.set(pattern, makeRouteHandler(routes.get(pattern))),
        new Map<Pattern, Handler>()
    );

    // Generate a function that, given an address, returns the handler for the best-matching route.
    let selectRouteHandler = makeDispatcher(taxonomy, routeHandlers);

    // TODO: ...
    return function __compiledRuleSet__(address: string, request: Request) {
        let handleRoute = selectRouteHandler(address);
        let response = handleRoute(address, request);
        return response;
    };
}





// TODO: ...
function findAllRoutesThroughRuleSet(taxonomy: Taxonomy, ruleSet: RuleSet): Map<Pattern, Route> {

    // TODO: ... NB: clarify ordering of best rules (ie least to most specific)
    let equalBestRules = taxonomy.allNodes.reduce(
        (map, node) => map.set(node.pattern, getEqualBestRulesForPattern(node.pattern, ruleSet)),
        new Map<Pattern, Rule[]>()
    );


    // TODO: doc...
    return taxonomy.allNodes.reduce(
        (map, node) => {

            // TODO: doc...
            let alternateRoutes = getAllPathsFromRootToHere(node)
                .map(path => path
                    .map(pattern => equalBestRules.get(pattern))
                    .reduce((route, rules) => route.concat(rules), [universalRule])
                );

            // TODO: make a single best route. Ensure no possibility of ambiguity.
            let singleRoute = reduceToSingleRoute(node.pattern, alternateRoutes);
            return map.set(node.pattern, singleRoute);
        },
        new Map<Pattern, Route>()
    );
}





// TODO:  make jsdoc...
// Associate each distinct pattern (ie unique by signature) with the set of rules from the ruleset that *exactly* match
// it. Some patterns may have no such rules. Because:
// > // `taxonomy` may include some patterns that are not in the ruleset, such as the always-present root pattern '…', as
// > // well as patterns synthesized at the intersection of overlapping patterns in the ruleset.

// TODO: add comment about Rule order in result (using tiebreak function).
function getEqualBestRulesForPattern(pattern: Pattern, ruleSet: RuleSet): Rule[] {

    // Compile the rule list for this pattern from the ruleset entries.
    let rules = Object.keys(ruleSet)
        .map(key => new Pattern(key))
        .filter(pat => pat.normalized === pattern.normalized)
        .map<Rule>(pat => ({ pattern: pat, handler: <any>ruleSet[pat.toString()] }));
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
function getAllPathsFromRootToHere(node: TaxonomyNode): Pattern[][] {
    // TODO: test/review/cleanup...
    let allPaths = [].concat(...node.generalizations.map(getAllPathsFromRootToHere));
    if (allPaths.length === 0) allPaths = [[]]; // no parent paths - this must be the root
    return allPaths.map(path => path.concat([node.pattern]));
}





// TODO: doc...
function reduceToSingleRoute(pattern: Pattern, candidates: Route[]) {

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
        handler: function crasher(): any {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${pattern}: ${ambiguousFallbacks.map(fn => fn.toString())}`);
        }
    };

    // final composite rule: splice of common prefix + crasher + common suffix
    let result = [].concat(prefix, crasher, suffix);
    return result;
}





// TODO: doc...
const nullHandler: Handler = function __nullHandler__() { return null; };





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

    // TODO: is '<' reliable here for string comparisons? What compare fn does it map to? Locale? Case?
    if (a.pattern.comment < b.pattern.comment) return a;
    if (b.pattern.comment < a.pattern.comment) return b;

    // TODO: all else being equal, partial handler is always more specific than general handler on the same pattern...
    if (isPartialHandler(a.handler) && !isPartialHandler(b.handler)) return a;
    if (isPartialHandler(b.handler) && !isPartialHandler(a.handler)) return b;
}
