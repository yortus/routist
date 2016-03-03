'use strict';
import * as assert from 'assert';
import {inspect} from 'util';
import Rule from './rule';





// TODO: doc...
export default function disambiguateRules(candidates: Rule[]): Rule[] {
    return candidates.slice().sort(ruleComparator);
}





// TODO: doc...
// TODO: improve error message/handling in here...
function ruleComparator(ruleA: Rule, ruleB: Rule) {
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
    if (!a.isDecorator && b.isDecorator) return a;
    if (!b.isDecorator && a.isDecorator) return b;
}
