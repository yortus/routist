'use strict';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// temp testing...
import test from './router2';
import makeDispatchFunction from './make-dispatch-function';





// TODO: doc...
export default class Router {


    // TODO: doc...
    constructor() {
    }


    // TODO: doc...
    add(routeTable: {[pattern: string]: Function}) {

        let routes = test(routeTable); // TODO: fix terminology: 'handler' is taken...

        let patternHierarchy = hierarchizePatterns(Object.keys(routeTable).map(src => new Pattern(src)));
        let selectRoute = makeDispatchFunction(patternHierarchy, routes);

        this.dispatch = (request: Request) => {
            let address = typeof request === 'string' ? request : request.address;
            let route = selectRoute(address);
            let response = route.execute(request);
            return response;
        };
    }


    // TODO: doc...
    dispatch(request: Request): Response {
        throw new Error(`Not ready!!! Call add first...`); // TODO: fix this...
    };
}
