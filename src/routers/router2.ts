'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import generateRuleList from './generate-rule-list';
import hierarchizePatterns, {PatternHierarchy} from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
import Rule, {Downstream} from '../rules/rule';
import walkPatternHierarchy from './walk-pattern-hierarchy';





// TODO: ...
type RouteTable = [string, Function][] | {[pattern: string]: Function};
export default function test(routeTable: RouteTable) {

    // TODO: ...
    let rules = generateRuleList(routeTable);

    // // TODO: add root pattern and rule if not there already...
    // // TODO: add it unconditionally and add tieBreak handler that always makes it the least specific rule
    // if (!rules.some(r => r.pattern.signature === '…')) {
    //     let rootRule = new Rule(new Pattern('…'), () => { throw new Error('404!');}); // TODO: proper handler?
    //     rules.unshift(rootRule);
    // }
    
    // TODO: get pattern hierarchy...
    // TODO: this may introduce synthesized pattern signatures for intersection points,
    //       for which there is no corresponding rule.
    let patternHierarchy = hierarchizePatterns(rules.map(rule => rule.pattern));

    // TODO: ...
    let signatures = enumerateSignatures(patternHierarchy);

    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    let rulesForPattern = signatures.reduce((map, sig) => {
        map[sig] = rules.filter(r => r.pattern.signature === sig);
        return map;
    }, <{[pattern: string]: Rule[]}>{});

    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    signatures.forEach(sig => {
        let rules = rulesForPattern[sig];
        if (rules.length === 0) {
            rules.push(new Rule(new Pattern(sig), noop));
        }
    });
    function noop() { return null; } // TODO: put elsewhere? Use Function.empty?

    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    signatures.forEach(pattern => {
        let rules = rulesForPattern[pattern];
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
        if (a.comment < b.comment) return a;
        if (b.comment < a.comment) return b;
    }    





    // TODO: for each pattern signature, get the list of paths that lead to it
    let patternWalks = walkPatternHierarchy(patternHierarchy, path => path);
console.log(patternWalks);

    // TODO: map from walks-of-patterns to walks-of-rules
    let ruleWalks = patternWalks.map(path => {
        let rulePath: Rule[] = [];
        for (let i = 0; i < path.length; ++i) {
            let signature = path[i];
            let rules = rulesForPattern[signature];
            rulePath = rulePath.concat(rules);
        }
        return rulePath;
    });


//console.log(ruleWalks);


    // TODO: for each pattern signature, get the ONE path or fail trying
debugger;
    let ruleWalkForPattern = signatures.reduce((map, sig) => {
        let candidates = ruleWalks.filter(walk => walk[walk.length - 1].pattern.signature === sig);

        if (candidates.length === 1) {
            map[sig] = candidates[0];
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

// console.log('-----CANDIDATES-----');
// console.log(candidates);
// console.log('-----PREFIX-----');
// console.log(commonPrefix);
// console.log('-----SUFFIX-----');
// console.log(commonSuffix);
// debugger;

        // TODO: possible for prefix and suffix to overlap?

        // ensure the non-common parts contain NO decorator rules.
        candidates.forEach(cand => {
            let choppedRules = cand.slice(prefixLength, -suffixLength);
            if (choppedRules.every(rule => !rule.isDecorator)) return;
            // TODO: improve error message/handling
            throw new Error(`Multiple routes to '${sig}' with different decorators`);
        });

        // synthesize a 'crasher' rule that throws an 'ambiguous' error.
        let fallbacks = candidates.map(cand => cand[cand.length - suffixLength - 1]);
        let crasher = new Rule(new Pattern(sig), function crasher() {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${sig}: ${fallbacks.map(r => r.toString())}`);
        });

        // final composite rule: splice of common prefix + crasher + common suffix
        let commonPrefix = candidates[0].slice(0, prefixLength);
        let commonSuffix = candidates[0].slice(-suffixLength);
        map[sig] = [].concat(commonPrefix, crasher, commonSuffix);
        return map;
    }, <{[pattern: string]: Rule[]}>{});


console.log(ruleWalkForPattern);




}




// TODO: ...
function enumerateSignatures(patternHierarchy: PatternHierarchy, map?: {}): string[] {
    map = map || {};

    Object.keys(patternHierarchy).forEach(pattern => {
        map[pattern] = true;
        enumerateSignatures(patternHierarchy[pattern], map);
    });    
    return arguments.length === 1 ? Object.keys(map) : null;
}
