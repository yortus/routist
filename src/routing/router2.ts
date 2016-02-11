'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import {getAllGraphNodes, getLongestCommonPrefix} from '../util';
import Handler from './handler';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import isDecorator from './is-decorator';
import normalizeHandler from './normalize-handler';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
import Route from './route';
import Rule from './rule';
import walkPatternHierarchy from './walk-pattern-hierarchy';





// TODO: ...
export default function test(routeTable: {[pattern: string]: Function}): Map<Pattern, Route> {

    // Form a list of rules from the given route table. Each rule's handler is normalized.
    let rules = Object.keys(routeTable).map(patternSource => {
        let pattern = new Pattern(patternSource);
        let handler = normalizeHandler(pattern, routeTable[patternSource]);
        return <Rule> { pattern, handler };
    });

    // TODO: get pattern hierarchy... NB: will always be rooted at '…' even if no '…' rule exists
    let patternHierarchy = hierarchizePatterns(rules.map(rule => rule.pattern));
    let normalizedPatterns = getAllGraphNodes(patternHierarchy);

    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: add no-op rules as needed so that code below may assume there are 1..M rules for each signature.
    // TODO: sort the rules using special tie-break function(s). Fail if any ambiguities are encountered.
    let rulesForPattern = normalizedPatterns.reduce((map, npat) => {
        let equalBestRules = rules.filter(rule => rule.pattern.normalized === npat);
        if (equalBestRules.length === 0) {
            equalBestRules.push({ pattern: npat, handler: nullHandler });
        }
        equalBestRules.sort(ruleComparator);
        return map.set(npat, equalBestRules);
    }, new Map<Pattern, Rule[]>());

    // TODO: for each pattern signature, get the list of rules that match, from least to most specific.
    let patternWalks = walkPatternHierarchy(patternHierarchy, path => path);
    let ruleWalks = patternWalks.map(patternWalk => patternWalk.reduce(
        (ruleWalk, pattern) => ruleWalk.concat(rulesForPattern.get(pattern)),
        <Rule[]>[]
    ));

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





// TODO: doc...
const nullHandler: Handler = request => null;





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
