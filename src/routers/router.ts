'use strict';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// temp testing...
import test from './router2';
import makeDecisionTree from './make-decision-tree';





// TODO: doc...
export default class Router {


    // TODO: doc...
    constructor() {
    }


    // TODO: doc...
    add(routeTable: {[pattern: string]: Function}) {
        let patternHierarchy = hierarchizePatterns(Object.keys(routeTable).map(src => new Pattern(src)));
        let finalHandlers = test(routeTable); // TODO: fix terminology: 'handler' is taken...
        let makeDecision = makeDecisionTree(patternHierarchy);

        this.dispatch = (request: Request) => {
            let address = typeof request === 'string' ? request : request.address;
            let bestPattern = makeDecision(address);
            let handler = finalHandlers.get(bestPattern);
            let response = handler(request);
            return response;
        };
    }


    // TODO: doc...
    dispatch(request: Request): Response {
        throw new Error(`Not ready!!! Call add first...`); // TODO: fix this...
    };
}
