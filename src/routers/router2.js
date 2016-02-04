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
    // TODO: add root pattern and rule if not there already...
    if (rules.some(r => r.pattern.signature === '…')) {
        let rootRule = new rule_1.default(new pattern_1.default('…'), () => { throw new Error('404!'); }); // TODO: proper handler?
        rules.unshift(rootRule);
    }
    // TODO: get pattern hierarchy...
    let patternHierarchy = hierarchize_patterns_1.default(rules.map(rule => rule.pattern));
    // TODO: for each pattern, get the list of rules that are equal-best matches for it...
    // TODO: assert 1..M such rules for each pattern signature
    let rulesForPattern = rules.reduce((map, r) => {
        r.pattern.signature;
        let key = r.pattern.signature;
        let val = map[key] || (map[key] = []);
        val.push(r);
        return map;
    }, {});
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
    function tieBreakFn(a, b) {
        if (a.comment < b.comment)
            return a;
        if (b.comment < a.comment)
            return b;
    }
    // TODO: for each pattern signature, get the list of paths that lead to it
    let walks = walk_pattern_hierarchy_1.default(patternHierarchy, path => path);
    // TODO: for each pattern signature, get the ONE path or fail trying
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = test;
//# sourceMappingURL=router2.js.map