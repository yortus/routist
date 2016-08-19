import * as assert from 'assert';
import {inspect} from 'util';
import Rule from './rule';
// TODO: `tieBreakFn` should be passed in or somehow provided from outside, with builtin fallback/default impl as below.





/**
 * Returns a copy of the given rule list, sorted from least- to most-specific. All rules in the rule list are assumed to
 * have equal specificity (i.e., their normalized patterns are the same). As such, there is no inherent way to recognise
 * their relative specificity. This is where the client-supplied 'tiebreak' function is used. It must provide an
 * unambiguous order in all cases where rules are otherwise of equivalent specificity.
 * @param {Rule[]} candidates - the list of rule of equal specificity to be sorted.
 * @returns {Rule[]} a copy of the given rule list, sorted from least- to most-specific.
 */
export default function disambiguateRules(candidates: Rule[]): Rule[] {
    return candidates.slice().sort(ruleComparator);
}





/** Performs pairwise sorting of two rules, using the convention of Array#sort's `compareFn` parameter. */
function ruleComparator(ruleA: Rule, ruleB: Rule) {
    let moreSpecificRule = tieBreakFn(ruleA, ruleB);
    let message = `ambiguous rules - which is more specific? A: ${inspect(ruleA)}, B: ${inspect(ruleB)}`;
    assert(moreSpecificRule === ruleA || moreSpecificRule === ruleB, message);
    assert.strictEqual(moreSpecificRule, tieBreakFn(ruleB, ruleA)); // consistency check
    return ruleA === moreSpecificRule ? 1 : -1; // NB: sorts from least- to most-specific
}





/** Returns the more-specific of the two given rules. */
function tieBreakFn(a: Rule, b: Rule): Rule {

    // All else being equal, a non-decorator is more specific than a decorator.
    if (!a.isDecorator && b.isDecorator) return a;
    if (!b.isDecorator && a.isDecorator) return b;

    // All else being equal, localeCompare of pattern comments provides the rule order (comes before == more specific).
    if (a.pattern.comment.localeCompare(b.pattern.comment) < 0) return a;
    if (b.pattern.comment.localeCompare(a.pattern.comment) < 0) return b;
}
