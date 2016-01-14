'use strict';
import * as assert from 'assert';
import comparePatterns, {PatternRelation as Relation} from './compare-patterns';
import intersectPatterns from './intersect-patterns';
import Request from './request';
import Response from './response';


// TODO: doc...
export default function makeRouteFamily(routes: Route[]): Node {

    // TODO: ...
    let root = makeNode({ pattern: '…' });
    routes.forEach(route => insert(route, root));
    return root;
}


// TODO: doc...
// TODO: doc precond: assumes route.pattern is a (proper or improper) subset of node.pattern
function insert(route: Route, node: Node) {

    // TODO: assert route.pattern is equal or subset of node.pattern    
    let relation = comparePatterns(route.pattern, node.pattern);
    assert(relation === Relation.Equal || relation === Relation.Subset);
    
    // Compare the new pattern to the pattern of each of the node's existing specialisations.
    let relations = node.specializations.map(spec => comparePatterns(route.pattern, spec.pattern));
    let equivalent = node.specializations.filter((_, i) => relations[i] === Relation.Equal);
    let moreGeneral = node.specializations.filter((_, i) => relations[i] === Relation.Subset);
    let moreSpecial = node.specializations.filter((_, i) => relations[i] === Relation.Superset);
    let overlapping = node.specializations.filter((_, i) => relations[i] === Relation.Overlapping);
    let unrelated = node.specializations.filter((_, i) => relations[i] === Relation.Disjoint);

    // Sanity check. Should be unnecessary due to invariants.
    assert(equivalent.length <= 1);
    assert(equivalent.length === 0 || moreGeneral.length === 0);
    assert(equivalent.length === 0 || moreSpecial.length === 0);
    assert(equivalent.length === 0 || overlapping.length === 0);
    assert(moreGeneral.length === 0 || moreSpecial.length === 0);

    // TODO: bundles etc...
    if (equivalent.length === 1) {
        if (route.handler) {
            equivalent[0].handlers.push(route.handler);
        }
        return;
    }

    // TODO: THE BIG CAHUNA - full treatment should be as follows:
    // - compute intersection of newPattern and child.pattern (FOR EACH ONE)
    // - addRouteToFamily(intersection, newFamily)
    // - addRouteToFamily(intersection, child)
    // - add newFamily to family
    if (overlapping.length > 0) {
        let newNode = makeNode(route);
        node.specializations.push(newNode);

        overlapping.forEach(overlap => {
            let intersection: Route = { pattern: intersectPatterns(newNode.pattern, overlap.pattern) };
            insert(intersection, overlap);
            insert(intersection, newNode);
        });
        return;
    }

    // TODO: can happen if some existing specializations overlap with each other and new one is in their intersection...
    if (moreGeneral.length > 0) {

        // TODO: recursively insert to every such specialization.
        moreGeneral.forEach(gen => insert(route, gen));
        return;
    }

    // TODO: route's pattern is more general than some existing specializations...
    if (moreSpecial.length > 0) {

        // Make a node for the new route.
        let newNode = makeNode(route);

        // TODO: transfer all such specializations to become specializations of newNode, then add newNode as a specialization of node
        newNode.specializations = moreSpecial;
        node.specializations = node.specializations.filter(spec => moreSpecial.indexOf(spec) === -1);
        node.specializations.push(newNode);
    }

    // TODO: simplest case... disjoint with all other specializations... just add it to the list...
    node.specializations.push(makeNode(route));
}





// TODO: doc...
interface Route {
    pattern: string; // TODO: assume canonical?
    handler?: (request: Request) => Response; // TODO: assume canonical?
}





// TODO: doc...
interface Node {
    pattern: string;
    handlers: any[];
    specializations: Node[];
    generalizations: Node[];
}





// TODO: doc...
function makeNode(route: Route): Node {
    return {
        pattern: route.pattern,
        handlers: route.handler ? [route.handler] : [],
        specializations: [],
        generalizations: []
    };
}
