import assert = require('assert');
//import _ = require('lodash');
import RoutePattern = require('./route-pattern');
//import Expression = require('./expression');
//var routeTableDSL = require('./routeTableDSL');
export = RouteFamily;


/**
 * Represents a set of routes, each of which has a pattern and a handler.
 * The routes are arranged in a tree structure, with the most general
 * route (ie the one matching the largest set of requests) at the root,
 * and the most specific routes (ie those matching the smallest set of
 * requests) at the leaves.
 */
class RouteFamily {


    /** Construct a new RouteFamily instance. */
    constructor(base: Route, specialisations?: RouteFamily[]) {
        this.base = base;
        this.specialisations = specialisations || [];
    }


    /**
     * Constructs a new RouteFamily instance from a list of routes. The family
     * is given a base route that matches all requests and produces a 404 error.
     * All of the routes in the given list are inserted as specialisations of
     * this base route.
     */
    static fromRouteList(routes: Route[]) {
        var family = new RouteFamily(baseRoute);
        routes.forEach(route => family.addRoute(route));
        return family;
    }


    /** Holds the most general route in this family. */
    base: Route;


    /**
     * Holds the routes that are more specialised than the base route.
     * Each specialisation is itself a route family, so every path through
     * the tree from root to leaf matches an ever more specialised subset of
     * requests. Also, the sets of requests matched by each specialisation in
     * this list are mutually disjoint, so there is never any ambiguity in
     * finding the best matching route in the family for a given request.
     */
    specialisations: RouteFamily[];


    /** Inserts the given route into the appropriate position in this family. */
    addRoute(route: Route) {
        addRouteToFamily(route, this);
    }


    /**
     * Returns a handler expression that evaluates to a response to the given
     * request. The handler corresponds to a short-circuiting 'or' of the handlers
     * for each matching route in this family, from most specific to most general.
     */
    getHandlerForRequest(method: string, pathname: string): Expression {
        return generateHandlerForRequest(this, method, pathname);
    }


    /** Depicts the route family as a multi-line list of pattern strings, with specialisations indented from their base. */
    toString(): string {
        var result = this.base ? this.base.pattern.canonical : '<top>';
        result += this.specialisations.map(spec => '\n' + spec.toString().split('\n').map(line => '  ' + line).join('\n')).join('');
        return result;
    }
}


/** A route is a simple pairing of a pattern and a handler. */
interface Route {
    pattern: RoutePattern;
    handler: Expression;
}


/** Singleton base route that matches all requests and responds with a 404 error. */
var baseRoute = <Route> {
    pattern: new RoutePattern(null, [], { name: null }, null),
    handler: Expression.parse('{ error: { statusCode: 404, message: "Not found" } }')
};


/** Private helper function for RouteFamily#addRoute. */
function addRouteToFamily(newRoute: Route, family: RouteFamily) {

    // For each of the family's existing specialisations, compute the intersection of the new route's pattern
    // with the specialisation's base pattern. The canonical form of the intersection pattern may then be used
    // to determine the relationship of the new route to each specialisation's base route (ie, subset, superset,
    // disjoint, equal, or otherwise).
    var canonicalIntersections = family.specialisations.map(spec => newRoute.pattern.intersectWith(spec.base.pattern).canonical);

    // TODO:...
    for (var i = 0; i < family.specialisations.length; ++i) {
        var candidate = newRoute.pattern.canonical;
        var comparand = family.specialisations[i].base.pattern.canonical;
        var intersect = canonicalIntersections[i];

        // If the new route's pattern is equivalent to an existing pattern, keep them both.
        // TODO: explain further... 'colocation'
        if (candidate === comparand) {
            var oldRoute = family.specialisations[i].base;
            var array = Expression.match(oldRoute.handler, {
                ArrayExpression: expr => expr,
                Otherwise: expr => Expression.build.ArrayExpression({ elements: [expr] })
            });
            array.elements.push(newRoute.handler);
            oldRoute.handler = array;
            return; // NB: newRoute is effectively inserted, so return immediately.
        }

        // If candidate and comparand don't have a superset, subset, or disjoint relationship, raise an error.
        // It's an error because under such circumstances, the new route cannot be inserted anywhere in the route
        // tree without introducing ambiguous paths through the tree.
        else if (intersect !== RoutePattern.EMPTY.canonical && candidate !== intersect && comparand !== intersect) {

            // TODO: experimental:
            //   instead of always failing when ambiguous routes are defined, only fail when a request
            //   matches the intersection of the two routes, which is the area of ambiguity:
            //   NB: If a route is defined that is equivalent to the intersection - what then? Must be robust!!
            //   NB: What about three-way and n-way sets of overlapping pattern sets in general? Must be robust!!
            //
            // Test case that currently fails:
            //   GET /**.json
            //   GET /api/hello/{name}
            //   GET /api/hello/carl
            //
            // Produces family:
            //   GET /**
            //     GET /api/hello/carl.json
            //     GET /api/hello/*.json
            //     ...
            //     GET /api/hello/*
            //     GET /api/hello/carl
            //
            //
            // approach:
            // - add the candidate route to the specialisations list
            // - make up a route for the intersection pattern whose handler produces an 'ambiguous' error
            // - add the intersection route to the specialisation list *before* the candidate and comparand routes
            var routeTable = routeTableDSL.parse(intersect + " ==> { error: { statusCode: 500, message: 'Ambiguous routes' } }"); // TODO: throw real exception server-side
            var intersectionRoute = <Route> {
                pattern: routeTable[0].pattern,
                handler: Expression.parse(routeTable[0].handlerText)
            };
            family.specialisations.push(new RouteFamily(newRoute));
            family.specialisations.unshift(new RouteFamily(intersectionRoute));
            return; // NB: newRoute is effectively inserted, so return immediately.


            // TODO: was...
            //throw new Error('Ambiguous routes: ' + candidate + ', ' + comparand);
        }
    }

    // Find the (at most one) child node that is less specialised than the new route.
    var moreGeneral = family.specialisations.filter((comparand, i) => canonicalIntersections[i] === newRoute.pattern.canonical);

    // Find the (zero or more) child nodes that are more specialised than the new route.
    var moreSpecial = family.specialisations.filter((comparand, i) => canonicalIntersections[i] === comparand.base.pattern.canonical);

    // Sanity check. Should be unnecessary due to invariants.
    assert(moreGeneral.length === 0 || moreSpecial.length === 0);
    assert(moreGeneral.length <= 1);

    // We now have enough information to insert the new route into the tree.
    if (moreGeneral.length > 0) {

        // There is already a specialisation that is more general than this new route.
        // Add the new route to the more general route's family (this is recursive).
        addRouteToFamily(newRoute, moreGeneral[0]);
    }
    else if (moreSpecial.length > 0) {

        // One or more existing specialisations are more specialised than the new route.
        // Add the new route to the specialisations list, and move those existing specialisations under it.
        family.specialisations = family.specialisations.filter(spec => moreSpecial.indexOf(spec) === -1);
        family.specialisations.push(new RouteFamily(newRoute, moreSpecial));
    }
    else {

        // The new route is disjoint with all other existing specialisations. Add it to the specialisations list.
        family.specialisations.push(new RouteFamily(newRoute));
    }
}


/**
 * Traces a path through the given route family from the root toward the leaves,
 * such that every route in the path matches the given method/pathname combination.
 * Returns a handler expression formed by short-circuit 'or'ing the handlers for
 * each route in the path, from most- to least-specific. Returns null if no matches.
 */
function generateHandlerForRequest(family: RouteFamily, method: string, pathname: string): Expression {

    // If the base route does not match the method/pathname, return null immediately.
    var bindings = family.base.pattern.match(method, pathname);
    if (!bindings) return null;

    // The base route matches the method/pathname. Create a handler consisting of the base
    // route's handler, but with local variable assignments for each binding key/value pair.
    // TODO: a let block would be better here, to prevent name clashes and value overwrites.
    var assignmentExprs = _(bindings).keys().map(name => Expression.build.AssignmentExpression({
        operator: '=',
        left: Expression.build.Identifier({ name: name }),
        right: Expression.build.Literal({ value: bindings[name] })
    })).value();
    var baseHandler = family.base.handler;
    if (assignmentExprs.length > 0) {
        baseHandler = Expression.build.SequenceExpression({ expressions: [].concat(assignmentExprs, baseHandler) });
    }

    // Recursively generate a handler from the family's specialisations, if one matches.
    for (var specHandler = null, i = 0; !specHandler && i < family.specialisations.length; ++i) {
        specHandler = generateHandlerForRequest(family.specialisations[i], method, pathname);
    }

    // If no more specialised handler could be generated, return the base handler.
    if (!specHandler) return baseHandler;

    // Combine the two handlers with a short-circuiting 'or', with the specialised one first.
    return Expression.build.LogicalExpression({
        operator: '||',
        left: specHandler,
        right: baseHandler
    });
}
