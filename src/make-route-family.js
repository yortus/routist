'use strict';
var assert = require('assert');
var intersect_patterns_1 = require('./intersect-patterns');
function test(patterns) {
    // TODO: construct the nodeFor() function
    let map = {};
    let nodeFor = (pattern) => map[pattern] || (map[pattern] = { pattern, specializations: {} });
    // TODO: construct the graph...
    patterns = patterns.filter(p => p !== '…' && p !== '∅');
    patterns.forEach(pattern => insert(pattern, '…', nodeFor));
    let graph = map['…'];
    return graph;
}
exports.default = test;
function insert(pattern, insertUnder, nodeFor) {
    // TODO: check preconds
    assert(intersect_patterns_1.default(pattern, nodeFor(insertUnder).pattern) === pattern);
    assert(pattern !== '∅');
    // TODO: simple cases: pattern disjoint with all existing patterns; pattern already present
    let nonDisjointComparands = Object.keys(nodeFor(insertUnder).specializations)
        .map(p => ({ pattern: p, intersection: intersect_patterns_1.default(pattern, p) }))
        .filter(cmp => cmp.intersection !== '∅');
    if (nonDisjointComparands.length === 0) {
        nodeFor(insertUnder).specializations[pattern] = nodeFor(pattern);
    }
    if (nodeFor(insertUnder).specializations[pattern])
        return;
    // TODO: ...
    nonDisjointComparands.forEach(cmp => {
        let specializesExisting = cmp.intersection === pattern;
        let generalizesExisting = cmp.intersection === cmp.pattern;
        let overlapsExisting = !specializesExisting && !generalizesExisting;
        if (generalizesExisting) {
            delete nodeFor(insertUnder).specializations[cmp.pattern];
        }
        if (generalizesExisting || overlapsExisting) {
            nodeFor(insertUnder).specializations[pattern] = nodeFor(pattern);
            insert(cmp.intersection, pattern, nodeFor);
        }
        if (specializesExisting || overlapsExisting) {
            insert(cmp.intersection, cmp.pattern, nodeFor);
        }
    });
}
//# sourceMappingURL=make-route-family.js.map