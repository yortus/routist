'use strict';
import * as assert from 'assert';
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

    // TODO: add root pattern and rule if not there already...
    if (rules.some(r => r.pattern.signature === '…')) {
        let rootRule = new Rule(new Pattern('…'), () => { throw new Error('404!');}); // TODO: proper handler?
        rules.unshift(rootRule);
    }
    
    // TODO: get pattern hierarchy...
    let patternHierarchy = hierarchizePatterns(rules.map(rule => rule.pattern));

    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    let rulesForPattern = rules.reduce((map, r) => {
        r.pattern.signature
        let key = r.pattern.signature;
        let val = map[key] || (map[key] = []);
        val.push(r);
        return map;
    }, <{[pattern: string]: Rule[]}>{});

    // Order equal-best rules using tie-break rules. Fail if any ambiguities remain.
    // TODO: improve error message/handling in here...
    Object.keys(rulesForPattern).forEach(pattern => {
        let rules = rulesForPattern[pattern];
        rules.sort((a, b) => {
           let moreSpecific = tieBreakFn(a, b);
           assert(moreSpecific === a || moreSpecific === b, `ambiguous rules - which is more specific? A: ${a}, B: ${b}`);
           assert.strictEqual(moreSpecific, tieBreakFn(b, a)); // consistency check
           return moreSpecific === a ? 1 : -1;
        });
    });
console.log(JSON.stringify(rulesForPattern, null, 4));    

    // TODO: this should be passed in or somehow provided from outside...
    // TODO: return the WINNER, a.k.a. the MORE SPECIFIC rule
    function tieBreakFn(a: Rule, b: Rule): Rule {
        if (a.comment < b.comment) return a;
        if (b.comment < a.comment) return b;
    }    







    // TODO: for each pattern signature, get the list of paths that lead to it
    let walks = walkPatternHierarchy(patternHierarchy, path => path);






    // TODO: for each pattern signature, get the ONE path or fail trying
    





    
}



