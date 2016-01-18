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

    // TODO: ...
    let patternNode = nodePool[pattern];

    // TODO: simple cases: pattern is '∅'; spec list currently empty; pattern already present as specialisation
    // Nothing to do if pattern is '∅' or is already present as a specialization of root
    if (pattern === '∅') return;
    if (root.specializations.size === 0) root.specializations.add(patternNode);
    if (root.specializations.has(patternNode)) return;

    // TODO: check invariant - pattern can't be *both* a subset *and* and superset, no duplicates in spec list
    //assert(moreSpecializedThan.length === 0 || lessSpecializedThan.length === 0);

    // TODO: ...
    assert(root.specializations.size > 0);
    let generalizesOrOverlapsExisting = false;
    let allDisjoint = true;
    let specializesTheFollowing: string[] = [];

    // TODO: ...
    root.specializations.forEach(n => {
        let intersection = intersectPatterns(pattern, n.pattern);
        if (intersection === '∅') return;
        let specializesExisting = intersection === pattern;
        let generalizesExisting = intersection === n.pattern;
        allDisjoint = false;


        if (generalizesExisting) {
            root.specializations.delete(n);
        }

        if (generalizesExisting || !specializesExisting) {
            generalizesOrOverlapsExisting = true;
            insert(intersection, patternNode, nodePool);
        }

        if (specializesExisting || !generalizesExisting) {
            insert(intersection, n, nodePool);
        }

        if (specializesExisting) {
            specializesTheFollowing.push(n.pattern);
        }        
    });

    // TODO: ...
    let specs = Array.from(root.specializations).map(n => n.pattern);
    let intrs = specs.map(spec => intersectPatterns(pattern, spec));

    if (!allDisjoint && !generalizesOrOverlapsExisting) {
        // EXISTS(moreSpec, lessSpec or overlapping) AND !EXISTS(moreSpec or overlapping)
        // EXISTS(lessSpec)
        if (specializesTheFollowing.length === 0) {
            debugger;
        }
    }
    else {
        // !EXISTS(spec, gen or overlapping) OR EXISTS(gen or overlapping)
        // EXISTS(spec)
        // === NONE are spec
        // if (specializesTheFollowing.length > 0) {
        //     debugger;
        // }
        root.specializations.add(patternNode);
    }
        

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
