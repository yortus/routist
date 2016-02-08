'use strict';
import * as assert from 'assert';
import {getAllGraphNodes, getLongestCommonPrefix} from '../util';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
import Route from './route';
import Rule from './rule';
import walkPatternHierarchy from './walk-pattern-hierarchy';





// TODO: ...
export default function test(routeTable: {[patternSource: string]: Function}): Map<Pattern, Route> {

    // TODO: ...
    let rules = Object.keys(routeTable).map(ps => new Rule(new Pattern(ps), routeTable[ps]));

    // // TODO: add special root rule...
    // // TODO: add it unconditionally and add tieBreak handler that always makes it the least specific rule
    let _404 = new Rule(Pattern.UNIVERSAL, () => { throw new Error('404!');});
    rules.push(_404);

    // TODO: get pattern hierarchy...
    let patternHierarchy = hierarchizePatterns(rules.map(rule => rule.pattern)); // TODO: review this line...
    let normalizedPatterns = getAllGraphNodes(patternHierarchy);

    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    let rulesForPattern = normalizedPatterns.reduce((map, npat) => {
        map.set(npat, rules.filter(r => r.pattern.normalized === npat));
        return map;
    }, new Map<Pattern, Rule[]>());

    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    normalizedPatterns.forEach(npat => {
        let rules = rulesForPattern.get(npat);
        if (rules.length === 0) {
            rules.push(new Rule(npat, noop));
        }
    });
    function noop() { return null; } // TODO: put elsewhere? Use Function.empty?

    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    normalizedPatterns.forEach(npat => {
        let rules = rulesForPattern.get(npat);
        rules.sort((a, b) => {
           let moreSpecificPattern = tieBreakFn(a.pattern, b.pattern);
           let moreSpecificRule = moreSpecificPattern === a.pattern ? a : moreSpecificPattern === b.pattern ? b : null;
           assert(moreSpecificRule === a || moreSpecificRule === b, `ambiguous rules - which is more specific? A: ${a}, B: ${b}`);
           assert.strictEqual(moreSpecificPattern, tieBreakFn(b.pattern, a.pattern)); // consistency check
           return moreSpecificRule === a ? 1 : -1;
        });
    });

    // TODO: this should be passed in or somehow provided from outside...
    // TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
    function tieBreakFn(a: Pattern, b: Pattern): Pattern {
        if (a === _404.pattern) return b;
        if (b === _404.pattern) return a;
        if (a.comment < b.comment) return a;
        if (b.comment < a.comment) return b;
    }





    // TODO: for each pattern signature, get the list of paths that lead to it
    let patternWalks = walkPatternHierarchy(patternHierarchy, path => path);
//console.log(patternWalks);

    // TODO: map from walks-of-patterns to walks-of-rules
    let ruleWalks = patternWalks.map(pats => pats.reduce((rules, pat) => rules.concat(rulesForPattern.get(pat)), <Rule[]>[])); // TODO: shorten to <120
//console.log(ruleWalks);


    // TODO: for each pattern signature, get the ONE path or fail trying
    let ruleWalkForPattern = normalizedPatterns.reduce((map, npat) => {
        let candidates = ruleWalks.filter(walk => walk[walk.length - 1].pattern.normalized === npat.normalized); // TODO: inefficient! review this...

        // TODO: ... simple case...
        if (candidates.length === 1) {
            map.set(npat, candidates[0]);
            return map;
        }

        // find the longest common prefix and suffix of all the candidates.
        let prefix = getLongestCommonPrefix(candidates);
        let suffix = getLongestCommonPrefix(candidates.map(cand => cand.slice().reverse())).reverse(); // TODO: revise... inefficient copies...

        // TODO: possible for prefix and suffix to overlap? What to do?

        // ensure the non-common parts contain NO decorator rules.
        candidates.forEach(cand => {
            let choppedRules = cand.slice(prefix.length, -suffix.length);
            if (choppedRules.every(rule => !rule.isDecorator)) return;
            // TODO: improve error message/handling
            throw new Error(`Multiple routes to '${npat}' with different decorators`);
        });

        // synthesize a 'crasher' rule that throws an 'ambiguous' error.
        let fallbacks = candidates.map(cand => cand[cand.length - suffix.length - 1]);
        let crasher = new Rule(npat, function crasher() {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${npat}: ${fallbacks.map(r => r.toString())}`);
        });

        // final composite rule: splice of common prefix + crasher + common suffix
        map.set(npat, [].concat(prefix, crasher, suffix));
        return map;
    }, new Map<Pattern, Rule[]>());


//console.log(ruleWalkForPattern);





    // reduce each signature's rule walk down to a simple handler function.
    const noMore = (rq: Request) => <Response> null;
    let routes = normalizedPatterns.reduce((map, npat) => {
        return map.set(npat, new Route(ruleWalkForPattern.get(npat)));
    }, new Map<Pattern, Route>());

    return routes;
}
