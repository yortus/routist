'use strict';
import Handler from './handlers/handler';
import hierarchizePatterns from './patterns/hierarchize-patterns';
import Request from './request';
import Response from './response';
import Pattern from './patterns/pattern';





export default class Router {


    // TODO: doc...
    constructor() {
    }    


    // TODO: doc...
    add(routes: [string, Function][]);
    add(routes: {[pattern: string]: Function});
    add(routes: [string, Function][] | {[pattern: string]: Function}) {

        // Construct flat lists of all the patterns and handlers for the given routes.
        let patterns: Pattern[];
        let handlers: Handler[];
        if (Array.isArray(routes)) {
            patterns = routes.map(route => new Pattern(route[0]));
            handlers = routes.map((route, i) => new Handler(patterns[i], route[1]));
        }
        else {
            let keys = Object.keys(routes);
            patterns = keys.map(key => new Pattern(key));
            handlers = keys.map((key, i) => new Handler(patterns[i], routes[key]));
        }

        // TODO: hierarchize patterns!
        let dag = hierarchizePatterns(patterns);







    }    


    // TODO: doc...
    dispatch(request: Request): Response {
        // TODO: ...
        return null;        
    }
}
