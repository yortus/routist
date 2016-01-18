'use strict';
import * as assert from 'assert';
import comparePatterns, {PatternRelation as Relation} from './compare-patterns';
import intersectPatterns from './intersect-patterns';
import Request from './request';
import Response from './response';





export default function test(patterns: string[]) {

    // Remove '…' and duplicates and fill in all combinations of intersections.
    patterns = patterns.filter(p => p !== '…');
    patterns = removeDuplicates(patterns);
    patterns = transitiveClosureOverPatternIntersection(patterns);

    // Make a node for each pattern, including '…', and put all into a map keyed by pattern.
    let map = patterns.reduce((map, pat) => (map[pat] = makeNode(pat), map), <{[pattern: string]: Node}> {});
    map['…'] = makeNode('…');

    // TODO: construct the graph...
    let graph = map['…'];
    patterns.forEach(pattern => insert(pattern, graph, map));
    return graph;
}


function removeDuplicates(patterns: string[]): string[] {
    // TODO: faster method?
    let obj = {};
    patterns.forEach(p => obj[p] = true);
    return Object.keys(obj);
}



function transitiveClosureOverPatternIntersection(patterns: string[]): string[] {
    patterns = patterns.slice(); // don't mutate original
    let loBound = 0;
    let hiBound = patterns.length;

    while (true) {
        for (let i = loBound; i <hiBound; ++i) {
            let pi = patterns[i];
            for (let j = i + 1; j < hiBound; ++j) {
                let pj = patterns[j];

                let intersection = intersectPatterns(pi, pj);
                if (intersection === pi || intersection === pj) continue;
                if (patterns.indexOf(intersection) !== -1) continue;
                patterns.push(intersection);
            }
        }
        if (patterns.length === hiBound) return patterns;
        loBound = hiBound;
        hiBound = patterns.length;
    }
}


function insert(pattern: string, root: Node, nodePool: {[pattern: string]: Node}) {

    // TODO: check invariant
    assert(comparePatterns(pattern, root.pattern) === Relation.Subset);

    // Nothing to do if pattern is '∅' or is already present as a specialization of root
    if (pattern === '∅') return;
    if (root.specializations.find(n => pattern === n.pattern)) return;

    // Compare the pattern to each of the root's specialisations' patterns
    let intersections = root.specializations.map(spec => intersectPatterns(pattern, spec.pattern));

    let relations = root.specializations.map(spec => comparePatterns(pattern, spec.pattern));
    let moreSpecializedThan = root.specializations.filter((_, i) => relations[i] === Relation.Subset);
    let lessSpecializedThan = root.specializations.filter((_, i) => relations[i] === Relation.Superset);
    let overlappingWith = root.specializations.filter((_, i) => relations[i] === Relation.Overlapping);
    let disjointWith = root.specializations.filter((_, i) => relations[i] === Relation.Disjoint);

    // TODO: check invariant - pattern can't be *both* a subset *and* and superset, no duplicates in spec list
    assert(moreSpecializedThan.length === 0 || lessSpecializedThan.length === 0);

    // Form a new specializations list.
    let patternNode = nodePool[pattern];


    // TODO: ...
//     assert(lessSpecializedThan.length <= 1);
//     if (lessSpecializedThan.length === 1) {
//         root.specializations.filter        
// 
// 
//     }
// 

    // TODO: ...
    let addToSpecsA = false;
    let addToSpecsB = true;

    // TODO: ...
    root.specializations.forEach((n, i) => {
        let intersection = intersections[i];



        if (intersection === n.pattern || !(intersection === pattern || intersection === '∅')) {
            addToSpecsA = true;
            insert(intersection, patternNode, nodePool);
        }

        if (intersection === pattern || !(intersection === n.pattern || intersection === '∅')) {
            insert(intersection, n, nodePool);
        }

        if (intersection === pattern) {
            addToSpecsB = false;
        }
    });

    // TODO: ...
    //if (lessSpecializedThan.length > 0 || overlappingWith.length > 0 || moreSpecializedThan.length === 0) {
    if (addToSpecsA || addToSpecsB) {
        root.specializations.push(patternNode);
    }

    if (lessSpecializedThan.length > 0) {
        root.specializations = root.specializations.filter(n => lessSpecializedThan.indexOf(n) === -1);
    }
        

    // TODO: check invariants...
    assert(root.specializations.every(n => root.specializations.filter(n2 => n === n2).length === 1));
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
    specializations: Node[];
}





// TODO: doc...
function makeNode(pattern: string): Node {
    return {
        pattern,
        specializations: []
    };
}
