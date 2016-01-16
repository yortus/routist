'use strict';
var intersect_patterns_1 = require('./intersect-patterns');
function test(patterns) {
    return transitiveClosureOverPatternIntersection(patterns);
}
exports.default = test;
function transitiveClosureOverPatternIntersection(patterns) {
    let result = patterns.slice();
    let minJ = 0;
    let oldLength = result.length;
    while (true) {
        for (let i = 0; i < oldLength; ++i) {
            let pi = result[i];
            for (let j = Math.max(i + 1, minJ); j < oldLength; ++j) {
                let pj = result[j];
                let intersection = intersect_patterns_1.default(pi, pj);
                if (intersection === pi || intersection === pj)
                    continue;
                if (result.indexOf(intersection) !== -1)
                    continue;
                result.push(intersection);
            }
        }
        if (result.length === oldLength)
            break;
        minJ = oldLength;
        oldLength = result.length;
    }
    return result;
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