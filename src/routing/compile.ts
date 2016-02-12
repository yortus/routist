'use strict';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';
import Request from '../request';





// temp testing...
import test from './router2';
import makeDispatcher from './make-dispatcher';





// TODO: doc...
export default function compile(routeTable: {[pattern: string]: Function}) {

    let routes = test(routeTable); // TODO: fix terminology: 'handler' is taken...

    let patternHierarchy = hierarchizePatterns(Object.keys(routeTable).map(src => new Pattern(src)));
    let selectRoute = makeDispatcher(patternHierarchy, routes);

    function __compiledRouteTable__(request: Request) {
        let address = typeof request === 'string' ? request : request.address;
        let route = selectRoute(address);
        let response = route(request);
        return response;
    };

    return __compiledRouteTable__;
}
