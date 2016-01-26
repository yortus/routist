'use strict';
import * as assert from 'assert';
import Handler from '../handlers/handler';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import mapGraph from './mapGraph';
import Request from '../request';
import Response from '../response';
import Pattern from '../patterns/pattern';
import Rule from './rule';





// TODO: doc...
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

        // 
        let patternHierarchy = hierarchizePatterns(patterns);
        var ruleHierarchy = mapGraph(patternHierarchy, {

            addNode: (value, key) => {
                return new Rule(key || '');
            },
 
            addEdge: (parent: Rule, child: Rule) => {
                parent.moreSpecific.push(child);
                child.lessSpecific.push(parent);
            }
        });
        debugger;





//         // TODO: hierarchize patterns!
//         let patternDAG = hierarchizePatterns(patterns);
//         let allNodes: {[pattern: string]: Node} = {};
//         let nodeFor = (pattern: string) => allNodes[pattern] || (allNodes[pattern] = makeNode(pattern));
//         let dummy = patternDAG['…'];
// 
//         traverse('…', patternDAG['…']);
// 
//         // Build Node DAG
//         function traverse(pattern: string, specializations: typeof dummy, parent?: Node) {
//             let node = nodeFor(pattern);
//             if (parent) node.lessSpecialized.push(parent); // uplinks
//             if (node.pattern) return; // already visited
// 
//             let i = patterns.findIndex(p => pattern === p.signature);
//             node.pattern = patterns[i];
//             node.handler = handlers[i];
//             node.moreSpecialized = Object.keys(specializations).map(nodeFor); // downlinks
//             let keys = Object.keys(specializations);
//             keys.forEach(key => traverse(key, specializations[key], node));
//         }
// 
//         // Ensure each decorator appears only once in the DAG
//         // TODO: this is more restrictive that necessary. Better way?
//         // let dupliDecors = Object.keys(allNodes).filter(key => allNodes[key].handler.isDecorator && allNodes[key].lessSpecialized.length > 1);
//         // assert(dupliDecors.length === 0, `split decorators: '${dupliDecors.join("', '")}'`); // TODO: improve error message
// 
//         // Set root node
//         this.root = nodeFor('…');
    }


    // TODO: doc...
    dispatch(request: Request): Response {
        // TODO: ...

        let pathname = request.pathname;
        let path: Rule[] = [];
        let rule = this.root; // always starts with '…'; don't need to check this against pathname

        while (true) {
            path.push(rule);

            let foundChild: Rule = null;
            for (let i = 0; !foundChild && i < rule.moreSpecific.length; ++i) {
                let child = rule.moreSpecific[i];
                if (child.isMatch(pathname)) foundChild = child;
            }

            if (!foundChild) break;

            rule = foundChild;
        }

        // should have a path here...
        let fullPath = path.map(n => n.signature).join('   ==>   ');
        //debugger;
        return null;
    }
    

    // TODO: doc...
    private root: Rule;
}
