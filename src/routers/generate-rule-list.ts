'use strict';
import Pattern from '../patterns/pattern';
import Rule from '../rules/rule';





// TODO: doc...
export default function generateRuleList(routeTable: [string, Function][] | {[pattern: string]: Function}) {

    // Construct a flat list of rules for the given route table.
    let rules: Rule[];
    if (Array.isArray(routeTable)) {
        rules = routeTable.map(pair => new Rule(new Pattern(pair[0]), pair[1]));
    }
    else {
        let patterns = Object.keys(routeTable);
        rules = patterns.map(pat => new Rule(new Pattern(pat), routeTable[pat]));
    }

    // TODO: ...
    return rules;
}
