class RouteFamily {
    constructor(patterns) {
    }
}
function addRouteToFamily(newRoute, family) {
    // For each of the family's existing specialisations, compute the intersection of the new route's pattern
    // with the specialisation's base pattern. The canonical form of the intersection pattern may then be used
    // to determine the relationship of the new route to each specialisation's base route (ie, subset, superset,
    // disjoint, equal, or otherwise).
    //    var canonicalIntersections = family.specialisations.map(spec => newRoute.pattern.intersectWith(spec.base.pattern).canonical);
}
//# sourceMappingURL=route-family.js.map