'use strict';
import * as assert from 'assert';
import comparePatterns, {PatternRelation as Relation} from './compare-patterns';
import intersectPatterns from './intersect-patterns';
import Request from './request';
import Response from './response';





export default function test(patterns: string[]) {

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
    let map2: Map<string, Node> = new Map();
    function nodeFor(pattern: string) {
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


function insert(pattern: string, insertUnder: string, nodeFor: (pattern: string) => Node) {

    // TODO: check invariant
    assert(comparePatterns(pattern, nodeFor(insertUnder).pattern) === Relation.Subset);
    assert(pattern !== '∅');

    // TODO: ...

    // TODO: simple cases: pattern is '∅'; pattern disjoint with all existing; pattern already present as specialisation
    // Nothing to do if pattern is '∅' or is already present as a specialization of root
    let comparands = Array.from(nodeFor(insertUnder).specializations)
        .map(n => ({ pattern: n.pattern, intersection: intersectPatterns(pattern, n.pattern) }))
        .filter(cmp => cmp.intersection !== '∅');
    if (comparands.length === 0) {
        nodeFor(insertUnder).specializations.add(nodeFor(pattern));
    }
    if (nodeFor(insertUnder).specializations.has(nodeFor(pattern))) return;

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





// // TODO: doc...
// export default function makeRouteFamily(routes: Route[]): Node {
// 
//     // TODO: ...
//     // let root = makeNode('…');
//     // routes.forEach(route => insert(route, root, {'…':root}));
//     // return root;
// 
//     // TODO:
//     let patterns = routes.map(route => route.pattern);
//     let tree = makeNode('…');
//     patterns.forEach(pattern => insert(pattern, tree));
//     return tree;
//     
// }





// TODO: doc...
interface Route {
    pattern: string; // TODO: assume canonical?
    handler?: (request: Request) => Response; // TODO: assume canonical?
}





// TODO: doc...
interface Node {
    pattern: string;
    specializations: Set<Node>;
}





// TODO: doc...
function makeNode(pattern: string): Node {
    return {
        pattern,
        specializations: new Set()
    };
}
