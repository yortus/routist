'use strict';
import * as assert from 'assert';
import intersectPatterns from './intersect-patterns';





export default function test(patterns: string[]) {

    // TODO: construct the nodeFor() function
    let map: {[pattern: string]: Node} = {};
    let nodeFor = (pattern: string) => map[pattern] || (map[pattern] = <Node> {pattern, specializations: {}});

    // TODO: construct the graph...
    patterns = patterns.filter(p => p !== '…' && p !== '∅');
    patterns.forEach(pattern => insert(pattern, '…', nodeFor));
    let graph = map['…'];
    return graph;
}





function insert(pattern: string, insertUnder: string, nodeFor: (pattern: string) => Node) {

    // TODO: check preconds
    assert(intersectPatterns(pattern, nodeFor(insertUnder).pattern) === pattern);
    assert(pattern !== '∅');

    // TODO: simple cases: pattern disjoint with all existing patterns; pattern already present
    let nonDisjointComparands = Object.keys(nodeFor(insertUnder).specializations)
        .map(p => ({ pattern: p, intersection: intersectPatterns(pattern, p) }))
        .filter(cmp => cmp.intersection !== '∅');
    if (nonDisjointComparands.length === 0) {
        nodeFor(insertUnder).specializations[pattern] = nodeFor(pattern);
    }
    if (nodeFor(insertUnder).specializations[pattern]) return;

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





// TODO: doc...
interface Node {
    pattern: string;
    specializations: {[pattern: string]: Node};
}
