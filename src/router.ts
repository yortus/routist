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

        // TODO: add root pattern/handler if not there already
        if (!patterns.some(p => p.signature === '…')) {
            let rootPattern = new Pattern('…')
            patterns.push(rootPattern);
            handlers.push(new Handler(rootPattern, () => { throw new Error('404!');}));
        }

        // TODO: hierarchize patterns!
        let patternDAG = hierarchizePatterns(patterns);
        let allNodes = {};
        let nodeFor = (pattern: string): Node => allNodes[pattern] || (allNodes[pattern] = makeNode(pattern));
        let dummy = patternDAG['…'];

        debugger;
        traverse('…', patternDAG['…']);

        // Build Node DAG
        function traverse(pattern: string, specializations: typeof dummy, parent?: Node) {
            let node = nodeFor(pattern);
            if (parent) node.lessSpecialized.push(parent); // uplinks
            if (node.pattern) return; // already visited

            let i = patterns.findIndex(p => pattern === p.signature);
            node.pattern = patterns[i];
            node.handler = handlers[i];
            node.moreSpecialized = Object.keys(specializations).map(nodeFor); // downlinks
            let keys = Object.keys(specializations);
            keys.forEach(key => traverse(key, specializations[key], node));
        }



    }    


    // TODO: doc...
    dispatch(request: Request): Response {
        // TODO: ...
        return null;        
    }
}





// TODO: doc...
interface Node {
    signature: string;
    pattern: Pattern;
    handler: Handler;
    lessSpecialized: Node[];
    moreSpecialized: Node[];
}





// TODO: doc...
function makeNode(signature: string): Node {
    return {
        signature,
        pattern: null,
        handler: null,
        lessSpecialized: [],
        moreSpecialized: []
    };
}
