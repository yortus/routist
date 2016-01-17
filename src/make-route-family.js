'use strict';
var intersect_patterns_1 = require('./intersect-patterns');
function test(patterns) {
    patterns = removeDuplicates(patterns);
    patterns = transitiveClosureOverPatternIntersection(patterns);
    return patterns;
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
// // TODO: doc...
// interface Node {
//     pattern: string;
//     specializations: Node[];
// }
// 
// 
// 
// 
// 
// // TODO: doc...
// function makeNode(pattern: string): Node {
//     return {
//         pattern,
//         specializations: []
//     };
// }
//# sourceMappingURL=make-route-family.js.map