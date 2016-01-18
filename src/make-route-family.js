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
    // Nothing to do if pattern is '∅' or is already present as a specialization of root
    if (pattern === '∅')
        return;
    if (root.specializations.find(n => pattern === n.pattern))
        return;
    // Compare the pattern to each of the root's specialisations' patterns
    let relations = root.specializations.map(spec => compare_patterns_1.default(pattern, spec.pattern));
    let moreSpecializedThan = root.specializations.filter((_, i) => relations[i] === 2 /* Subset */);
    let lessSpecializedThan = root.specializations.filter((_, i) => relations[i] === 3 /* Superset */);
    let overlappingWith = root.specializations.filter((_, i) => relations[i] === 5 /* Overlapping */);
    let disjointWith = root.specializations.filter((_, i) => relations[i] === 4 /* Disjoint */);
    // TODO: check invariant - pattern can't be *both* a subset *and* and superset, no duplicates in spec list
    assert(moreSpecializedThan.length === 0 || lessSpecializedThan.length === 0);
    // Form a new specializations list.
    let newSpecializations = [];
    let patternNode = nodePool[pattern];
    // TODO: ...
    if (lessSpecializedThan.length > 0 || overlappingWith.length > 0 || moreSpecializedThan.length === 0) {
        newSpecializations.push(patternNode);
    }
    // TODO: ...
    lessSpecializedThan.forEach(n => {
        insert(n.pattern, patternNode, nodePool);
    });
    // TODO: ...
    moreSpecializedThan.forEach(n => {
        newSpecializations.push(n);
        insert(pattern, n, nodePool);
    });
    // TODO: ...
    overlappingWith.forEach(n => {
        newSpecializations.push(n);
        let intersection = intersect_patterns_1.default(pattern, n.pattern);
        insert(intersection, patternNode, nodePool);
        insert(intersection, n, nodePool);
    });
    // TODO: ...
    disjointWith.forEach(n => {
        newSpecializations.push(n);
    });
    // TODO: check invariants...
    assert(newSpecializations.every(n => newSpecializations.filter(n2 => n === n2).length === 1));
    // TODO: ...
    root.specializations = newSpecializations;
}
// TODO: doc...
function makeNode(pattern) {
    return {
        pattern,
        specializations: []
    };
}
//# sourceMappingURL=make-route-family.js.map