'use strict';
var assert = require('assert');
var generate_rule_list_1 = require('./generate-rule-list');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
var rule_1 = require('../rules/rule');
var walk_pattern_hierarchy_1 = require('./walk-pattern-hierarchy');
function test(routeTable) {
    // TODO: ...
    let rules = generate_rule_list_1.default(routeTable);
    // // TODO: add root pattern and rule if not there already...
    // // TODO: add it unconditionally and add tieBreak handler that always makes it the least specific rule
    // if (!rules.some(r => r.pattern.signature === '…')) {
    //     let rootRule = new Rule(new Pattern('…'), () => { throw new Error('404!');}); // TODO: proper handler?
    //     rules.unshift(rootRule);
    // }
    // TODO: get pattern hierarchy...
    // TODO: this may introduce synthesized pattern signatures for intersection points,
    //       for which there is no corresponding rule.
    let patternHierarchy = hierarchize_patterns_1.default(rules.map(rule => rule.pattern));
    // TODO: ...
    let signatures = enumerateSignatures(patternHierarchy);
    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    let rulesForPattern = signatures.reduce((map, sig) => {
        map[sig] = rules.filter(r => r.pattern.signature === sig);
        return map;
    }, {});
    // TODO: add no-op rules so that for each signature there are 1..M rules
    // TODO: review this... always correct to use no-op function in these cases? Even for ROOT?
    signatures.forEach(sig => {
        let rules = rulesForPattern[sig];
        if (rules.length === 0) {
            rules.push(new rule_1.default(new pattern_1.default(sig), noop));
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
    function tieBreakFn(a, b) {
        if (a.comment < b.comment)
            return a;
        if (b.comment < a.comment)
            return b;
    }
    // TODO: for each pattern signature, get the list of paths that lead to it
    let patternWalks = walk_pattern_hierarchy_1.default(patternHierarchy, path => path);
    //console.log(patternWalks);
    // TODO: map from walks-of-patterns to walks-of-rules
    let ruleWalks = patternWalks.map(path => {
        let rulePath = [];
        for (let i = 0; i < path.length; ++i) {
            let signature = path[i];
            let rules = rulesForPattern[signature];
            rulePath = rulePath.concat(rules);
        }
        return rulePath;
    });
    //console.log(ruleWalks);
    // TODO: for each pattern signature, get the ONE path or fail trying
    let ruleWalkForPattern = signatures.reduce((map, sig) => {
        let candidates = ruleWalks.filter(walk => walk[walk.length - 1].pattern.signature === sig);
        if (candidates.length === 1) {
            map[sig] = candidates[0];
            return map;
        }
        // find the longest common prefix of all the candidates.
        let prefixLength = 0;
        while (true) {
            if (candidates.some(cand => cand.length <= prefixLength))
                break;
            let el = candidates[0][prefixLength];
            if (!candidates.every(cand => cand[prefixLength] === el))
                break;
            ++prefixLength;
        }
        // find the longest common suffix of all the candidates.
        let suffixLength = 0;
        while (true) {
            if (candidates.some(cand => cand.length <= suffixLength))
                break;
            let el = candidates[0][candidates[0].length - 1 - suffixLength];
            if (!candidates.every(cand => cand[cand.length - 1 - suffixLength] === el))
                break;
            ++suffixLength;
        }
        // TODO: possible for prefix and suffix to overlap?
        // ensure the non-common parts contain NO decorator rules.
        candidates.forEach(cand => {
            let choppedRules = cand.slice(prefixLength, -suffixLength);
            if (choppedRules.every(rule => !rule.isDecorator))
                return;
            // TODO: improve error message/handling
            throw new Error(`Multiple routes to '${sig}' with different decorators`);
        });
        // synthesize a 'crasher' rule that throws an 'ambiguous' error.
        let fallbacks = candidates.map(cand => cand[cand.length - suffixLength - 1]);
        let crasher = new rule_1.default(new pattern_1.default(sig), function crasher() {
            // TODO: improve error message/handling
            throw new Error(`Multiple possible fallbacks from '${sig}: ${fallbacks.map(r => r.toString())}`);
        });
        // final composite rule: splice of common prefix + crasher + common suffix
        let commonPrefix = candidates[0].slice(0, prefixLength);
        let commonSuffix = candidates[0].slice(-suffixLength);
        map[sig] = [].concat(commonPrefix, crasher, commonSuffix);
        return map;
    }, {});
    //console.log(ruleWalkForPattern);
    // reduce each signature's rule walk down to a simple handler function.
    const noMore = { execute: () => null };
    let finalHandlers = signatures.map(sig => {
        let ruleWalk = ruleWalkForPattern[sig];
        let d = ruleWalk.reduce((ds, rule) => {
            let downstream = {
                execute: request => rule.execute(request, ds)
            };
            return downstream;
        }, noMore);
        return d.execute;
    });
    //console.log(finalHandlers);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = test;
// TODO: ...
function enumerateSignatures(patternHierarchy, map) {
    map = map || {};
    Object.keys(patternHierarchy).forEach(pattern => {
        map[pattern] = true;
        enumerateSignatures(patternHierarchy[pattern], map);
    });
    return arguments.length === 1 ? Object.keys(map) : null;
}
//# sourceMappingURL=router2.js.map