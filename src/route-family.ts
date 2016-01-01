
import RoutePattern from './route-pattern';


interface Route {
    pattern: RoutePattern;
}


class RouteFamily {


    constructor(patterns: RoutePattern[]) {
        
    }


    base: Route;

    specialisations: RouteFamily;
    



}


function addRouteToFamily(newRoute: Route, family: RouteFamily) {

    // For each of the family's existing specialisations, compute the intersection of the new route's pattern
    // with the specialisation's base pattern. The canonical form of the intersection pattern may then be used
    // to determine the relationship of the new route to each specialisation's base route (ie, subset, superset,
    // disjoint, equal, or otherwise).
//    var canonicalIntersections = family.specialisations.map(spec => newRoute.pattern.intersectWith(spec.base.pattern).canonical);
    


}
