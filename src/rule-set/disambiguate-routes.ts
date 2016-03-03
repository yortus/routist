'use strict';
import {getLongestCommonPrefix} from '../util';
import Pattern from '../pattern';
import {Route} from './types';
import Rule from './rule';





// TODO: doc...
export default function disambiguateRoutes(pattern: Pattern, candidates: Route[]): Route {

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
        let choppedRules: Rule[] = cand.slice(prefix.length, -suffix.length);
        if (choppedRules.every(rule => !rule.isDecorator)) return;
        // TODO: improve error message/handling
        throw new Error(`Multiple routes to '${pattern}' with different decorators`);
    });

    // Synthesize a 'crasher' rule that throws an 'ambiguous' error.
    let ambiguousFallbacks = candidates.map(cand => cand[cand.length - suffix.length - 1]);
    let crasher = new Rule(
        pattern.toString(),
        function crasher() {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${pattern}: ${ambiguousFallbacks.map(fn => fn.toString())}`);
        }
    );

    // final composite rule: splice of common prefix + crasher + common suffix
    let result = [].concat(prefix, crasher, suffix);
    return result;
}
