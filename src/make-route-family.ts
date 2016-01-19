'use strict';
import * as assert from 'assert';
import intersectPatterns from './intersect-patterns';





export default function test(patterns: string[]) {

    // TODO: construct the nodeFor() function
    let map = new Map<string, Node>();
    let nodeFor = (pattern: string) => map[pattern] || (map[pattern] = <Node> {pattern, specializations: new Set});

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
    let nonDisjointComparands = Array.from(nodeFor(insertUnder).specializations)
        .map(n => ({ pattern: n.pattern, intersection: intersectPatterns(pattern, n.pattern) }))
        .filter(cmp => cmp.intersection !== '∅');
    if (nonDisjointComparands.length === 0) {
        nodeFor(insertUnder).specializations.add(nodeFor(pattern));
    }
    if (nodeFor(insertUnder).specializations.has(nodeFor(pattern))) return;

    // TODO: ...
    nonDisjointComparands.forEach(cmp => {
        let specializesExisting = cmp.intersection === pattern;
        let generalizesExisting = cmp.intersection === cmp.pattern;
        let overlapsExisting = !specializesExisting && !generalizesExisting;

        if (generalizesExisting) {
            nodeFor(insertUnder).specializations.delete(nodeFor(cmp.pattern));
        }

        if (generalizesExisting || overlapsExisting) {
            nodeFor(insertUnder).specializations.add(nodeFor(pattern));
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
    specializations: Set<Node>;
}
