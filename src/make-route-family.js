'use strict';
var assert = require('assert');
var compare_patterns_1 = require('./compare-patterns');
var intersect_patterns_1 = require('./intersect-patterns');
// TODO: doc...
function makeRouteFamily(routes) {
    // TODO: ...
    let root = makeNode({ pattern: '…' });
    routes.forEach(route => insert(route, root));
    return root;
}
exports.default = makeRouteFamily;
// TODO: doc...
// TODO: doc precond: assumes route.pattern is a (proper or improper) subset of node.pattern
function insert(route, node) {
    // TODO: assert route.pattern is equal or subset of node.pattern    
    let relation = compare_patterns_1.default(route.pattern, node.pattern);
    assert(relation === 1 /* Equal */ || relation === 2 /* Subset */);
    // Compare the new pattern to the pattern of each of the node's existing specialisations.
    let relations = node.specializations.map(spec => compare_patterns_1.default(route.pattern, spec.pattern));
    let equivalent = node.specializations.filter((_, i) => relations[i] === 1 /* Equal */);
    let moreGeneral = node.specializations.filter((_, i) => relations[i] === 2 /* Subset */);
    let moreSpecial = node.specializations.filter((_, i) => relations[i] === 3 /* Superset */);
    let overlapping = node.specializations.filter((_, i) => relations[i] === 5 /* Overlapping */);
    let unrelated = node.specializations.filter((_, i) => relations[i] === 4 /* Disjoint */);
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
            let intersection = { pattern: intersect_patterns_1.default(newNode.pattern, overlap.pattern) };
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
function makeNode(route) {
    return {
        pattern: route.pattern,
        handlers: route.handler ? [route.handler] : [],
        specializations: [],
        generalizations: []
    };
}
//# sourceMappingURL=make-route-family.js.map