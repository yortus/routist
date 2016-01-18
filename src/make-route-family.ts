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
    let relations = root.specializations.map(spec => comparePatterns(pattern, spec.pattern));
    let moreSpecializedThan = root.specializations.filter((_, i) => relations[i] === Relation.Subset);
    let lessSpecializedThan = root.specializations.filter((_, i) => relations[i] === Relation.Superset);
    let overlappingWith = root.specializations.filter((_, i) => relations[i] === Relation.Overlapping);
    let disjointWith = root.specializations.filter((_, i) => relations[i] === Relation.Disjoint);

    // TODO: check invariant - pattern can't be *both* a subset *and* and superset, no duplicates in spec list
    assert(moreSpecializedThan.length === 0 || lessSpecializedThan.length === 0);

    // Form a new specializations list.
    let newSpecializations: Node[] = [];
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
        let intersection = intersectPatterns(pattern, n.pattern);
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
