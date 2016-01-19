'use strict';
var assert = require('assert');
var compare_patterns_1 = require('./compare-patterns');
var intersect_patterns_1 = require('./intersect-patterns');
function test(patterns) {
    // Remove '…' and duplicates and fill in all combinations of intersections.
    patterns = patterns.filter(p => p !== '…');
    // patterns = removeDuplicates(patterns);
    // patterns = transitiveClosureOverPatternIntersection(patterns);
    // Remove useless '∅' if present
    patterns = patterns.filter(p => p !== '∅');
    // Make a node for each pattern, including '…', and put all into a map keyed by pattern.
    //let map = patterns.reduce((map, pat) => (map[pat] = makeNode(pat), map), <{[pattern: string]: Node}> {});
    //map['…'] = makeNode('…');
    // TODO: construct the nodeFor() function
    let map2 = new Map();
    function nodeFor(pattern) {
        let n = map2[pattern];
        if (!n) {
            n = makeNode(pattern);
            map2[pattern] = n;
        }
        return n;
    }
    // TODO: was...
    //let nodeFor = pattern => map[pattern];
    // TODO: construct the graph...
    patterns.forEach(pattern => insert(pattern, '…', nodeFor));
    let graph = map2['…'];
    return graph;
}
exports.default = test;
// function removeDuplicates(patterns: string[]): string[] {
//     // TODO: faster method?
//     let obj = {};
//     patterns.forEach(p => obj[p] = true);
//     return Object.keys(obj);
// }
// function transitiveClosureOverPatternIntersection(patterns: string[]): string[] {
//     patterns = patterns.slice(); // don't mutate original
//     let loBound = 0;
//     let hiBound = patterns.length;
// 
//     while (true) {
//         for (let i = loBound; i <hiBound; ++i) {
//             let pi = patterns[i];
//             for (let j = i + 1; j < hiBound; ++j) {
//                 let pj = patterns[j];
// 
//                 let intersection = intersectPatterns(pi, pj);
//                 if (intersection === pi || intersection === pj) continue;
//                 if (patterns.indexOf(intersection) !== -1) continue;
//                 patterns.push(intersection);
//             }
//         }
//         if (patterns.length === hiBound) return patterns;
//         loBound = hiBound;
//         hiBound = patterns.length;
//     }
// }
function insert(pattern, insertUnder, nodeFor) {
    // TODO: check invariant
    assert(compare_patterns_1.default(pattern, nodeFor(insertUnder).pattern) === 2 /* Subset */);
    assert(pattern !== '∅');
    // TODO: ...
    // TODO: simple cases: pattern is '∅'; pattern disjoint with all existing; pattern already present as specialisation
    // Nothing to do if pattern is '∅' or is already present as a specialization of root
    let comparands = Array.from(nodeFor(insertUnder).specializations)
        .map(n => ({ pattern: n.pattern, intersection: intersect_patterns_1.default(pattern, n.pattern) }))
        .filter(cmp => cmp.intersection !== '∅');
    if (comparands.length === 0) {
        nodeFor(insertUnder).specializations.add(nodeFor(pattern));
    }
    if (nodeFor(insertUnder).specializations.has(nodeFor(pattern)))
        return;
    // TODO: check invariant - pattern can't be *both* a subset *and* and superset, no duplicates in spec list
    //assert(moreSpecializedThan.length === 0 || lessSpecializedThan.length === 0);
    // TODO: ...
    comparands.forEach(cmp => {
        let specializesExisting = cmp.intersection === pattern;
        let generalizesExisting = cmp.intersection === cmp.pattern;
        if (generalizesExisting) {
            nodeFor(insertUnder).specializations.delete(nodeFor(cmp.pattern));
        }
        if (generalizesExisting || !specializesExisting) {
            nodeFor(insertUnder).specializations.add(nodeFor(pattern));
            insert(cmp.intersection, pattern, nodeFor);
        }
        if (specializesExisting || !generalizesExisting) {
            insert(cmp.intersection, cmp.pattern, nodeFor);
        }
    });
    // TODO: check invariants...
    //assert(root.specializations.every(n => root.specializations.filter(n2 => n === n2).length === 1));
}
// TODO: doc...
function makeNode(pattern) {
    return {
        pattern,
        specializations: new Set()
    };
}
//# sourceMappingURL=make-route-family.js.map