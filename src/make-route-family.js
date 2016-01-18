'use strict';
var assert = require('assert');
var compare_patterns_1 = require('./compare-patterns');
var intersect_patterns_1 = require('./intersect-patterns');
function test(patterns) {
    // Remove '…' and duplicates and fill in all combinations of intersections.
    patterns = patterns.filter(p => p !== '…');
    patterns = removeDuplicates(patterns);
    patterns = transitiveClosureOverPatternIntersection(patterns);
    // Make a node for each pattern, including '…', and put all into a map keyed by pattern.
    let map = patterns.reduce((map, pat) => (map[pat] = makeNode(pat), map), {});
    map['…'] = makeNode('…');
    // TODO: construct the graph...
    let graph = map['…'];
    patterns.forEach(pattern => insert(pattern, graph, map));
    return graph;
}
exports.default = test;
function removeDuplicates(patterns) {
    // TODO: faster method?
    let obj = {};
    patterns.forEach(p => obj[p] = true);
    return Object.keys(obj);
}
function transitiveClosureOverPatternIntersection(patterns) {
    patterns = patterns.slice(); // don't mutate original
    let loBound = 0;
    let hiBound = patterns.length;
    while (true) {
        for (let i = loBound; i < hiBound; ++i) {
            let pi = patterns[i];
            for (let j = i + 1; j < hiBound; ++j) {
                let pj = patterns[j];
                let intersection = intersect_patterns_1.default(pi, pj);
                if (intersection === pi || intersection === pj)
                    continue;
                if (patterns.indexOf(intersection) !== -1)
                    continue;
                patterns.push(intersection);
            }
        }
        if (patterns.length === hiBound)
            return patterns;
        loBound = hiBound;
        hiBound = patterns.length;
    }
}
function insert(pattern, root, nodePool) {
    // TODO: check invariant
    assert(compare_patterns_1.default(pattern, root.pattern) === 2 /* Subset */);
    // TODO: ...
    let patternNode = nodePool[pattern];
    // TODO: simple cases: pattern is '∅'; spec list currently empty; pattern already present as specialisation
    // Nothing to do if pattern is '∅' or is already present as a specialization of root
    if (pattern === '∅')
        return;
    if (root.specializations.size === 0)
        root.specializations.add(patternNode);
    if (root.specializations.has(patternNode))
        return;
    // TODO: check invariant - pattern can't be *both* a subset *and* and superset, no duplicates in spec list
    //assert(moreSpecializedThan.length === 0 || lessSpecializedThan.length === 0);
    // TODO: ...
    assert(root.specializations.size > 0);
    let addToSpecsA = false;
    let addToSpecsB = true;
    let subsetCount = 0;
    // TODO: ...
    root.specializations.forEach(n => {
        let intersection = intersect_patterns_1.default(pattern, n.pattern);
        let specializesExisting = intersection === pattern;
        let generalizesExisting = intersection === n.pattern;
        let overlapsExisting = intersection !== '∅' || specializesExisting || generalizesExisting;
        if (generalizesExisting) {
            root.specializations.delete(n);
        }
        if (generalizesExisting || (intersection !== '∅' && !specializesExisting)) {
            addToSpecsA = true;
            insert(intersection, patternNode, nodePool);
        }
        if (specializesExisting || (intersection !== '∅' && !generalizesExisting)) {
            insert(intersection, n, nodePool);
        }
        if (specializesExisting) {
            ++subsetCount;
            addToSpecsB = false;
        }
    });
    // TODO: ...
    //if (lessSpecializedThan.length > 0 || overlappingWith.length > 0 || moreSpecializedThan.length === 0) {
    let specs = Array.from(root.specializations).map(n => n.pattern);
    if (addToSpecsA || addToSpecsB) {
        //if (addToSpecsA) {
        // if (subsetCount === specs.length) {
        //     debugger;
        // }
        root.specializations.add(patternNode);
    }
    else {
    }
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