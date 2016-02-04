'use strict';
var pattern_1 = require('../patterns/pattern');
var rule_1 = require('../rules/rule');
// TODO: doc...
function generateRuleList(routeTable) {
    // Construct a flat list of rules for the given route table.
    let rules;
    if (Array.isArray(routeTable)) {
        rules = routeTable.map(pair => new rule_1.default(new pattern_1.default(pair[0]), pair[1]));
    }
    else {
        let patterns = Object.keys(routeTable);
        rules = patterns.map(pat => new rule_1.default(new pattern_1.default(pat), routeTable[pat]));
    }
    // TODO: ...
    return rules;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateRuleList;
//# sourceMappingURL=generate-rule-list.js.map