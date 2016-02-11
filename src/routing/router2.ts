'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import {getAllGraphNodes, getLongestCommonPrefix} from '../util';
import Handler from './handler';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import isDecorator from './is-decorator';
import makeNormalizedHandlerFunction from './make-normalized-handler-function';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
import Route from './route';
import Rule from './rule';
import walkPatternHierarchy from './walk-pattern-hierarchy';





// TODO: ...
export default function test(routeTable: {[pattern: string]: Function}): Map<Pattern, Route> {

    // TODO: ...
    let rules = Object.keys(routeTable).map(patternSource => {
        let pattern = new Pattern(patternSource);
        let handler = makeNormalizedHandlerFunction(pattern, routeTable[patternSource]);
        return <Rule> { pattern, handler };
    });

    // TODO: add special universal fallback rule...
    rules.push(universalRule);

    // TODO: get pattern hierarchy...
    let patternHierarchy = hierarchizePatterns(rules.map(rule => rule.pattern));
    let normalizedPatterns = getAllGraphNodes(patternHierarchy);

    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    let rulesForPattern = normalizedPatterns.reduce((map, npat) => {
        map.set(npat, rules.filter(rule => rule.pattern.normalized === npat));
        return map;
    }, new Map<Pattern, Rule[]>());

    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    normalizedPatterns.forEach(npat => {
        let candidates = rulesForPattern.get(npat);
        if (candidates.length > 0) return;
        candidates.push(<Rule> { pattern: npat, handler: noop });
    });
    function noop() { return null; } // TODO: put elsewhere? Use Function.empty?

    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    normalizedPatterns.forEach(npat => {
        let candidates = rulesForPattern.get(npat);
        candidates.sort((ruleA, ruleB) => {
            let moreSpecificRule = tieBreakFn(ruleA, ruleB);
            assert(moreSpecificRule === ruleA || moreSpecificRule === ruleB, `ambiguous rules - which is more specific? A: ${inspect(ruleA)}, B: ${inspect(ruleB)}`); // TODO: test/improve this message
            assert.strictEqual(moreSpecificRule, tieBreakFn(ruleB, ruleA)); // consistency check
            return moreSpecificRule === ruleA ? 1 : -1;
        });
    });

    // TODO: for each pattern signature, get the list of paths through the pattern hierarchy that lead to it
    let patternWalks = walkPatternHierarchy(patternHierarchy, path => path);
//console.log(patternWalks);

    // TODO: map from walks-of-patterns to walks-of-rules
    let ruleWalks = patternWalks.map(patternWalk => patternWalk.reduce(
        (ruleWalk, pattern) => ruleWalk.concat(rulesForPattern.get(pattern)),
        <Rule[]>[]
    ));
//console.log(ruleWalks);


    // TODO: for each pattern signature, get the ONE path or fail trying...
    let ruleWalkForPattern = normalizedPatterns.reduce((map, npat) => {

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
            if (choppedRules.every(rule => !isDecorator(rule.handler))) return;
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
    const noMore = (rq: Request) => <Response> null;
    let routes = normalizedPatterns.reduce((map, npat) => {
        let ruleWalk = ruleWalkForPattern.get(npat);
        let name = ruleWalk[ruleWalk.length - 1].pattern.toString(); // TODO: convoluted and inefficient. Fix this.
        return map.set(npat, new Route(name, ruleWalk.map(rule => rule.handler)));
    }, new Map<Pattern, Route>());

    return routes;
}





// TODO: what should the universal handler really do? Must not be transport-specific.
let universalRule: Rule = {
    pattern: Pattern.UNIVERSAL,
    handler: (request): any => { throw new Error('404!'); }
};





// TODO: this should be passed in or somehow provided from outside...
// TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
// TODO: universalHandler must ALWAYS be the least specific rule
function tieBreakFn(a: Rule, b: Rule): Rule {
    if (a === universalRule) return b;
    if (b === universalRule) return a;
    if (a.pattern.comment < b.pattern.comment) return a;
    if (b.pattern.comment < a.pattern.comment) return b;
}
