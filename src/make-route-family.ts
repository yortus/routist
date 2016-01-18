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
// 
// 
// 
// 
// function insert(pattern: string, tree: Node): void {
// 
//     // TODO: ...
//     let relation = comparePatterns(pattern, tree.pattern);
//     if (relation === Relation.Equal) return; // nothing to do
//     assert(relation === Relation.Subset); // assert invariant
// 
//     // TODO: doc flags...
//     let equalsExisting = false;
//     let specializesExisting = false;
//     let generalizesExisting = false;
//     let overlapsExisting = false;
// 
//     // TODO: ...
//     let comparands = tree.specializations.slice();
//     comparands.forEach((comparand, i) => {
//         switch (comparePatterns(pattern, comparand.pattern)) {
// 
//             case Relation.Equal:
//                 equalsExisting = true;
//                 break;
// 
//             case Relation.Subset:
//                 // Recursively insert the new node under the existing specialized node of which it is a further specialization.
//                 specializesExisting = true;
//                 break;
// 
//             case Relation.Superset:
//                 // TODO: explain...
//                 generalizesExisting = true;
//                 break;
// 
//             case Relation.Overlapping:
//                 // TODO: explain...
//                 overlapsExisting = true;
//                 break;
//         }
//     });
// 
//     // TODO: ...
//     if (!equalsExisting && (generalizesExisting || overlapsExisting || !specializesExisting)) {
//         // TODO: add as direct specialization
//         tree.specializations.push()
//     }        
// 
// 
// }
// 
// 
// 
// 
// 
// 
// 
// // TODO: doc...
// function insertOLD(newNode: Node, dag: Node): void {
// 
//     // TODO: redundant sanity checks... remove...
//     assert(find(newNode.pattern, dag) === null);
//     assert(comparePatterns(newNode.pattern, dag.pattern) === Relation.Subset);
// 
//     // TODO: doc flags...
//     let specializesExisting = false;
//     let generalizesExisting = false;
//     let overlapsExisting = false;
// 
//     // Insert it everywhere we need to...
//     // - as direct child IFF ...?
//     // - as indirect child IFF ...?
//     let comparands = dag.specializations.slice();
//     comparands.forEach((comparand, i) => {
//         switch (comparePatterns(newNode.pattern, comparand.pattern)) {
// 
//             case Relation.Equal:
//                 // Can't ever reach here according to precondition that `node` is not anywhere in `dag`
//                 assert(false);
//                 break;
// 
//             case Relation.Subset:
//                 // Recursively insert the new node under the existing specialized node of which it is a further specialization.
//                 insert(newNode, comparand);
//                 specializesExisting = true;
//                 break;
// 
//             case Relation.Superset:
//                 // TODO: explain...
//                 dag.specializations.splice(i, 1); // remove from dag
//                 newNode.specializations.push(comparand); // add under newNode
//                 generalizesExisting = true;
//                 break;
// 
//             case Relation.Overlapping:
//                 // TODO: explain...
//                 let intersectionPattern = intersectPatterns(newNode.pattern, comparand.pattern);
//                 let intersectionNode = find(intersectionPattern, dag) || makeNode(intersectionPattern);
//                  comparand
//                 newNode.specializations.push(intersectionNode);
// 
//                 overlapsExisting = true;
//                 break;
//         }
// 
//         // TODO: ...
//         if (generalizesExisting || overlapsExisting || !specializesExisting) {
//             // TODO: add as direct specialization
//         }        
//     });
// }
// 
// 
// 
// 
// 
// // TODO: doc... inefficient...
// function find(pattern: string, dag: Node): Node {
//     let result = pattern === dag.pattern ? dag : null;
//     for(let i = 0; !result && i < dag.specializations.length; ++i) {
//         result = find(pattern, dag.specializations[i]);
//     }
//     return result;
// }
// 
// 
// 
// 
// 
// // TODO: doc...
// // TODO: doc precond: assumes route.pattern is a (proper or improper) subset of node.pattern
// function insert2(route: Route, insertionRoot: Node, allNodes: { [pattern: string]: Node; }) {
// 
//     // TODO: assert route.pattern is equal or subset of node.pattern
//     let relation = comparePatterns(route.pattern, insertionRoot.pattern);
//     assert(relation === Relation.Equal || relation === Relation.Subset);
// 
//     // Compare the new pattern to the pattern of each of the node's existing specialisations.
//     let relations = insertionRoot.specializations.map(spec => comparePatterns(route.pattern, spec.pattern));
//     let equivalent = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Equal);
//     let moreGeneral = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Subset);
//     let moreSpecial = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Superset);
//     let overlapping = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Overlapping);
//     let unrelated = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Disjoint);
// 
//     // Sanity check. Should be unnecessary due to invariants.
//     assert(equivalent.length <= 1);
//     assert(equivalent.length === 0 || moreGeneral.length === 0);
//     assert(equivalent.length === 0 || moreSpecial.length === 0);
//     assert(equivalent.length === 0 || overlapping.length === 0);
//     assert(moreGeneral.length === 0 || moreSpecial.length === 0);
// 
//     // TODO: bundles etc...
//     if (equivalent.length === 1) {
//         if (route.handler) {
//             equivalent[0].handlers.push(route.handler);
//         }
//         return;
//     }
// 
//     // TODO: THE BIG CAHUNA - full treatment should be as follows:
//     // - compute intersection of newPattern and child.pattern (FOR EACH ONE)
//     // - addRouteToFamily(intersection, newFamily)
//     // - addRouteToFamily(intersection, child)
//     // - add newFamily to family
//     if (overlapping.length > 0) {
//         let newNode = makeNode(route.pattern, route.handler);
//         insertionRoot.specializations.push(newNode);
// 
//         overlapping.forEach(overlap => {
//             let intersection: Route = { pattern: intersectPatterns(newNode.pattern, overlap.pattern) };
//             insert2(intersection, overlap, allNodes);
//             insert2(intersection, newNode, allNodes);
//         });
//         return;
//     }
// 
//     // TODO: can happen if some existing specializations overlap with each other and new one is in their intersection...
//     if (moreGeneral.length > 0) {
// 
//         // TODO: recursively insert to every such specialization.
//         moreGeneral.forEach(gen => insert2(route, gen, allNodes));
//         return;
//     }
// 
//     // TODO: route's pattern is more general than some existing specializations...
//     if (moreSpecial.length > 0) {
// 
//         // Make a node for the new route.
//         let newNode = makeNode(route.pattern, route.handler);
// 
//         // TODO: transfer all such specializations to become specializations of newNode, then add newNode as a specialization of node
//         newNode.specializations = moreSpecial;
//         insertionRoot.specializations = insertionRoot.specializations.filter(spec => moreSpecial.indexOf(spec) === -1);
//         insertionRoot.specializations.push(newNode);
// 
//         return;        
//     }
// 
//     // TODO: simplest case... disjoint with all other specializations... just add it to the list...
//     insertionRoot.specializations.push(makeNode(route.pattern, route.handler));
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
