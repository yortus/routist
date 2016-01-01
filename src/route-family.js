class RouteFamily {
    constructor(pattern) {
    }
}
function addRouteToFamily(newPattern, family) {
    // Compare the new pattern to the pattern of each of the family's existing children.
    let relations = family.children.map(child => newPattern.compare(child.pattern));
    let equivalent = family.children.filter((_, i) => relations[i] === 1 /* Equal */);
    let moreGeneral = family.children.filter((_, i) => relations[i] === 2 /* Subset */);
    let moreSpecial = family.children.filter((_, i) => relations[i] === 3 /* Superset */);
    let unrelated = family.children.filter((_, i) => relations[i] === 4 /* Disjoint */);
    let ambiguous = family.children.filter((_, i) => relations[i] === 5 /* Overlapping */);
    // Make a new RouteFamily instance for the new pattern.
    let newFamily = new RouteFamily(newPattern);
    // TODO: implement as follows:
    equivalent; // bundles etc - just error for now
    moreGeneral; // recursively addRouteToFamily to every such child
    moreSpecial; // transfer all such children to become children of newFamily, then add newFamily as child of family
    unrelated; // nothing to do for these
    ambiguous; // THE BIG CAHUNA - just error for now. But full treatment should be as follows:
    // - compute intersection of newPattern and child.pattern (FOR EACH ONE)
    // - addRouteToFamily(intersection, newFamily)
    // - addRouteToFamily(intersection, child)
    // - add newFamily to family
}
//# sourceMappingURL=route-family.js.map