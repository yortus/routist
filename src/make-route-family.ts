'use strict';
import * as assert from 'assert';
import comparePatterns, {PatternRelation as Relation} from './compare-patterns';
import intersectPatterns from './intersect-patterns';
import Request from './request';
import Response from './response';


// TODO: doc...
export default function makeRouteFamily(routes: Route[]): Node {

    // TODO: ...
    // let root = makeNode('…');
    // routes.forEach(route => insert(route, root, {'…':root}));
    // return root;

    // TODO:
    let nodes = routes.map(route => makeNode(route.pattern, route.handler));
    let roots = constructDAG(nodes);
    assert(roots.length > 0);
    let result: Node;
    if (roots.length === 1) {
        result = roots[0];
    }
    else {
        result = makeNode('…');
        result.specializations = roots;
    }
    return result;
}





// TODO: doc...
// TODO: doc... returns null if pattern is not a proper subset of searchRoot's pattern.
function constructDAG(todo: Node[], done?: Node[], roots?: Node[]): Node[] {
    done = done || [];
    roots = roots || [];

    // TODO: quit if nothing left to do...
    if (todo.length === 0) return roots;

    // TODO: get a node that hasn't been added to the DAG yet...
    let newNode = todo.pop();

    // TODO: add the node to the DAG, or just update it if it's already there
    let existing = done.find(n => n.pattern === newNode.pattern);
    if (existing) {
        // TODO: already there... just update handlers...
        existing.handlers = existing.handlers.concat(newNode.handlers);
    }
    else {
        // TODO: it's a new node to add... compare to existing roots to find all insertion points...

        roots.push(newNode);
        

        // TODO: add to done list
        done.push(newNode);
    }

    // TODO: Finish recursively...
    // TODO: recursive tail call! Could grow stack a lot! revise...
    return constructDAG(todo, done, roots);
}





// TODO: doc...
function insert(newNode: Node, dag: Node): void {

    // TODO: redundant sanity checks... remove...
    assert(find(newNode.pattern, dag) === null);
    assert(comparePatterns(newNode.pattern, dag.pattern) === Relation.Subset);

    // TODO: doc flag...
    let specializesExisting = false;
    let generalizesExisting = false;
    let overlapsExisting = false;

    // Insert it everywhere we need to...
    // - as direct child IFF ...?
    // - as indirect child IFF ...?
    let comparands = dag.specializations.slice();
    comparands.forEach((comparand, i) => {
        switch (comparePatterns(newNode.pattern, comparand.pattern)) {

            case Relation.Equal:
                // Can't ever reach here according to precondition that `node` is not anywhere in `dag`
                assert(false);
                break;

            case Relation.Subset:
                // Recursively insert the new node under the existing specialized node of which it is a further specialization.
                insert(newNode, comparand);
                specializesExisting = true;
                break;

            case Relation.Superset:
                // TODO: explain...
                dag.specializations.splice(i, 1); // remove from dag
                newNode.specializations.push(comparand); // add under newNode
                generalizesExisting = true;
                break;

            case Relation.Overlapping:
                // TODO: explain...
                let intersectionPattern = intersectPatterns(newNode.pattern, comparand.pattern);
                let intersectionNode = find(intersectionPattern, dag) || makeNode(intersectionPattern);
                 comparand
                newNode.specializations.push(intersectionNode);

                overlapsExisting = true;
                break;
        }

        // TODO: ...
        if (generalizesExisting || overlapsExisting || !specializesExisting) {
            // TODO: add as direct specialization
        }        
    });
}





// TODO: doc... inefficient...
function find(pattern: string, dag: Node): Node {
    let result = pattern === dag.pattern ? dag : null;
    for(let i = 0; !result && i < dag.specializations.length; ++i) {
        result = find(pattern, dag.specializations[i]);
    }
    return result;
}





// TODO: doc...
// TODO: doc precond: assumes route.pattern is a (proper or improper) subset of node.pattern
function insert2(route: Route, insertionRoot: Node, allNodes: { [pattern: string]: Node; }) {

    // TODO: assert route.pattern is equal or subset of node.pattern
    let relation = comparePatterns(route.pattern, insertionRoot.pattern);
    assert(relation === Relation.Equal || relation === Relation.Subset);

    // Compare the new pattern to the pattern of each of the node's existing specialisations.
    let relations = insertionRoot.specializations.map(spec => comparePatterns(route.pattern, spec.pattern));
    let equivalent = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Equal);
    let moreGeneral = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Subset);
    let moreSpecial = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Superset);
    let overlapping = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Overlapping);
    let unrelated = insertionRoot.specializations.filter((_, i) => relations[i] === Relation.Disjoint);

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
        let newNode = makeNode(route.pattern, route.handler);
        insertionRoot.specializations.push(newNode);

        overlapping.forEach(overlap => {
            let intersection: Route = { pattern: intersectPatterns(newNode.pattern, overlap.pattern) };
            insert2(intersection, overlap, allNodes);
            insert2(intersection, newNode, allNodes);
        });
        return;
    }

    // TODO: can happen if some existing specializations overlap with each other and new one is in their intersection...
    if (moreGeneral.length > 0) {

        // TODO: recursively insert to every such specialization.
        moreGeneral.forEach(gen => insert2(route, gen, allNodes));
        return;
    }

    // TODO: route's pattern is more general than some existing specializations...
    if (moreSpecial.length > 0) {

        // Make a node for the new route.
        let newNode = makeNode(route.pattern, route.handler);

        // TODO: transfer all such specializations to become specializations of newNode, then add newNode as a specialization of node
        newNode.specializations = moreSpecial;
        insertionRoot.specializations = insertionRoot.specializations.filter(spec => moreSpecial.indexOf(spec) === -1);
        insertionRoot.specializations.push(newNode);

        return;        
    }

    // TODO: simplest case... disjoint with all other specializations... just add it to the list...
    insertionRoot.specializations.push(makeNode(route.pattern, route.handler));
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
function makeNode(pattern: string, handler?: (request: Request) => Response): Node {
    return {
        pattern,
        handlers: handler ? [handler] : [],
        specializations: [],
        generalizations: []
    };
}
