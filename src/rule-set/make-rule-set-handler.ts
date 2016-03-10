'use strict';
import disambiguateRoutes from './disambiguate-routes';
import disambiguateRules from './disambiguate-rules';
import makeRouteSelector from './make-route-selector';
import makeRouteHandler from './make-route-handler';
import Pattern from '../pattern';
import RouteHandler from './route-handler';
import Rule from './rule';
import Taxonomy, {TaxonomyNode} from '../taxonomy';





/** Internal function used to generate the RuleSet#execute method. */
export default function makeRuleSetHandler(rules: {[pattern: string]: Function}): RouteHandler {

    // Generate a taxonomic arrangement of all the patterns that occur in the rule set.
    let taxonomy = new Taxonomy(Object.keys(rules).map(src => new Pattern(src)));

    // Find all functionally-distinct routes that an address can take through the rule set.
    let routes = findAllRoutesThroughRuleSet(taxonomy, rules);

    // Create an aggregate handler for each distinct route through the rule set.
    let routeHandlers = Array.from(routes.keys()).reduce(
        (map, pattern) => map.set(pattern, makeRouteHandler(routes.get(pattern))),
        new Map<Pattern, RouteHandler>()
    );

    // Generate a function that, given an address, returns the handler for the best-matching route.
    let selectRouteHandler = makeRouteSelector(taxonomy, routeHandlers);

    // TODO: ...
    return function __compiledRuleSet__(address: string, request: any) { // TODO: import Request type!
        let handleRoute = selectRouteHandler(address);
        let response = handleRoute(address, request);
        return response;
    };
}





// TODO: ...
function findAllRoutesThroughRuleSet(taxonomy: Taxonomy, rules: {[pattern: string]: Function}): Map<Pattern, Rule[]> {

    // TODO: ... NB: clarify ordering of best rules (ie least to most specific)
    // TODO: explain sort... all rules are equal by pattern signature, but we need an unambiguous ordering.
    // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
    let equalBestRules = taxonomy.allNodes.reduce(
        (map, node) => {
            let bestRules = getEqualBestRulesForPattern(node.pattern, rules);
            bestRules = disambiguateRules(bestRules); // NB: may throw
            map.set(node.pattern, bestRules);
            return map;
        },
        new Map<Pattern, Rule[]>()
    );


    // TODO: doc...
    return taxonomy.allNodes.reduce(
        (map, node) => {

            // TODO: doc...
            let alternatePathways = getAllPathwaysFromRootToHere(node)
                .map(path => path
                    .map(pattern => equalBestRules.get(pattern))
                    .reduce((route, rules) => route.concat(rules), [universalRule])
                );

            // TODO: make a single best route. Ensure no possibility of ambiguity.
            let singleRoute = disambiguateRoutes(node.pattern, alternatePathways);
            return map.set(node.pattern, singleRoute);
        },
        new Map<Pattern, Rule[]>()
    );
}





// TODO:  make jsdoc...
// Associate each distinct pattern (ie unique by signature) with the set of rules from the ruleset that *exactly* match
// it. Some patterns may have no such rules. Because:
// > // `taxonomy` may include some patterns that are not in the ruleset, such as the always-present root pattern '…', as
// > // well as patterns synthesized at the intersection of overlapping patterns in the ruleset.

// TODO: add comment about Rule order in result (using tiebreak function).
function getEqualBestRulesForPattern(pattern: Pattern, rules: {[pattern: string]: Function}): Rule[] {

    // Compile the rule list for this pattern from the ruleset entries.
    let bestRules = Object.keys(rules)
        .map(key => new Pattern(key))
        .filter(pat => pat.normalized === pattern.normalized)
        .map(pat => pat.toString())
        .map(key => new Rule(key, rules[key]));
        //TODO:...was...remove?... .map<Rule>(pat => ({ pattern: pat, handler: normalizeHandler(pat, ruleSet[pat.toString()]) }));

    // TODO: ...
    return bestRules;
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
function getAllPathwaysFromRootToHere(node: TaxonomyNode): Pattern[][] {
    // TODO: test/review/cleanup...
    let allPaths = [].concat(...node.generalizations.map(getAllPathwaysFromRootToHere));
    if (allPaths.length === 0) allPaths = [[]]; // no parent paths - this must be the root
    return allPaths.map(path => path.concat([node.pattern]));
}





// TODO: doc...
const nullHandler: RouteHandler = function __nullHandler__() { return null; };





// TODO: doc...
const universalRule = new Rule(Pattern.UNIVERSAL.toString(), nullHandler);
