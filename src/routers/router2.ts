'use strict';
import * as assert from 'assert';
import getAllGraphNodes from '../utils/get-all-graph-nodes';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
import Rule from '../rules/rule';
import walkPatternHierarchy from './walk-pattern-hierarchy';





// TODO: remove this? rename to finalExecutors? all internal anyway...
// TODO: fix terminology: 'handler' is taken...
type FinalHandlers = Map<Pattern, (rq: Request) => Response>;





// TODO: ...
export default function test(routeTable: {[patternSource: string]: Function}): FinalHandlers {

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
           let moreSpecific = tieBreakFn(a, b);
           assert(moreSpecific === a || moreSpecific === b, `ambiguous rules - which is more specific? A: ${a}, B: ${b}`);
           assert.strictEqual(moreSpecific, tieBreakFn(b, a)); // consistency check
           return moreSpecific === a ? 1 : -1;
        });
    });

    // TODO: this should be passed in or somehow provided from outside...
    // TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
    function tieBreakFn(a: Rule, b: Rule): Rule {
        if (a === _404) return b;
        if (b === _404) return a;
        if (a.comment < b.comment) return a;
        if (b.comment < a.comment) return b;
    }    





    // TODO: for each pattern signature, get the list of paths that lead to it
    let patternWalks = walkPatternHierarchy(patternHierarchy, path => path);
//console.log(patternWalks);

    // TODO: map from walks-of-patterns to walks-of-rules
    let ruleWalks = patternWalks.map(path => {
        let rulePath: Rule[] = [];
        for (let i = 0; i < path.length; ++i) {
            let rules = rulesForPattern.get(path[i]);
            rulePath = rulePath.concat(rules);
        }
        return rulePath;
    });


//console.log(ruleWalks);


    // TODO: for each pattern signature, get the ONE path or fail trying
    let ruleWalkForPattern = normalizedPatterns.reduce((map, npat) => {
        let candidates = ruleWalks.filter(walk => walk[walk.length - 1].pattern.normalized === npat.normalized); // TODO: inefficient! review this...

        if (candidates.length === 1) {
            map.set(npat, candidates[0]);
            return map;
        }

        // find the longest common prefix of all the candidates.
        let prefixLength = 0;
        while (true) {
            if (candidates.some(cand => cand.length <= prefixLength)) break;
            let el = candidates[0][prefixLength];
            if (!candidates.every(cand => cand[prefixLength] === el)) break;
            ++prefixLength;
        }

        // find the longest common suffix of all the candidates.
        let suffixLength = 0;
        while (true) {
            if (candidates.some(cand => cand.length <= suffixLength)) break;
            let el = candidates[0][candidates[0].length - 1 - suffixLength];
            if (!candidates.every(cand => cand[cand.length - 1 - suffixLength] === el)) break;
            ++suffixLength;
        }

        // TODO: possible for prefix and suffix to overlap?

        // ensure the non-common parts contain NO decorator rules.
        candidates.forEach(cand => {
            let choppedRules = cand.slice(prefixLength, -suffixLength);
            if (choppedRules.every(rule => !rule.isDecorator)) return;
            // TODO: improve error message/handling
            throw new Error(`Multiple routes to '${npat}' with different decorators`);
        });

        // synthesize a 'crasher' rule that throws an 'ambiguous' error.
        let fallbacks = candidates.map(cand => cand[cand.length - suffixLength - 1]);
        let crasher = new Rule(npat, function crasher() {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${npat}: ${fallbacks.map(r => r.toString())}`);
        });

        // final composite rule: splice of common prefix + crasher + common suffix
        let commonPrefix = candidates[0].slice(0, prefixLength);
        let commonSuffix = candidates[0].slice(-suffixLength);
        map.set(npat, [].concat(commonPrefix, crasher, commonSuffix));
        return map;
    }, new Map<Pattern, Rule[]>());


//console.log(ruleWalkForPattern);





    // reduce each signature's rule walk down to a simple handler function.
    const noMore = (rq: Request) => <Response> null;
    let finalHandlers = normalizedPatterns.reduce((map, npat) => {
        let reverseRuleWalk = ruleWalkForPattern.get(npat).slice().reverse();
        map.set(npat, reverseRuleWalk.reduce((ds, rule) => request => rule.execute(request, ds), noMore));
        return map;
    }, new Map<Pattern, (rq: Request) => Response>());

    return finalHandlers;
}
