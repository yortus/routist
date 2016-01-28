'use strict';
import * as assert from 'assert';
import Handler from '../handlers/handler';
import hierarchizePatterns from '../patterns/hierarchize-patterns';
import mapGraph from './mapGraph';
import Request from '../request';
import Response from '../response';
import Pattern from '../patterns/pattern';
import Route from './route';
import RuleNode from './rule-node';





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
            handlers.push(new Handler(rootPattern, () => { throw new Error('404!');})); // TODO: proper handler?
        }

        // TODO: ...
        let patternHierarchy = hierarchizePatterns(patterns);
        debugger;


        let allRules: RuleNode[] = [];
        var ruleHierarchy = mapGraph(patternHierarchy, {

            addNode: (value, key) => {
                if (!key) return -1;
                let rule = new RuleNode(key || '');
                return allRules.push(rule) - 1;
            },
 
            addEdge: (parent: number, child: number) => {
                if (parent === -1) return;
                allRules[parent].moreSpecific.push(child);
                allRules[child].lessSpecific.push(parent);
            }
        });

debugger;



        // TODO: set root node
        //assert(ruleHierarchy.moreSpecific.length === 1);
        //assert(ruleHierarchy.moreSpecific[0].signature === '…');
        //this.rootRule = ruleHierarchy.moreSpecific[0];


        let allRoutes = allRules.map(rule => {
            let route: Route = {
                isMatch: null,
                moreSpecific: rule.moreSpecific,
                execute: null
            };
        });




        debugger;
        traceAllRoutes(allRules[0], allRules);
        debugger;



//         // Ensure each decorator appears only once in the DAG
//         // TODO: this is more restrictive that necessary. Better way?
//         // let dupliDecors = Object.keys(allNodes).filter(key => allNodes[key].handler.isDecorator && allNodes[key].lessSpecialized.length > 1);
//         // assert(dupliDecors.length === 0, `split decorators: '${dupliDecors.join("', '")}'`); // TODO: improve error message

    }


    // TODO: doc...
//     dispatch(request: Request): Response {
//         // TODO: ...
// 
//         let pathname = request.pathname;
//         let path: RuleNode[] = [];
//         let rule = this.rootRule; // always starts with '…'; don't need to check this against pathname
// 
//         while (true) {
//             path.push(rule);
// 
//             let foundChild: RuleNode = null;
//             for (let i = 0; !foundChild && i < rule.moreSpecific.length; ++i) {
//                 let child = rule.moreSpecific[i];
//                 if (child.isMatch(pathname)) foundChild = child;
//             }
// 
//             if (!foundChild) break;
// 
//             rule = foundChild;
//         }
// 
//         // should have a path here...
//         let fullPath = path.map(n => n.signature).join('   ==>   ');
//         //debugger;
//         return null;
//     }
    

    // TODO: doc...
    //private allRules: RuleNode[];
    //private rootRule: RuleNode;
}


// TODO: ...
function traceAllRoutes(rootRule: RuleNode, allRules: RuleNode[]) {
    var x = allRules.map(rule => {
        let incompletePaths: RuleNode[][] = [[rule]];
        let completePaths: RuleNode[][] = [];
        while (incompletePaths.length > 0) {
            let incompletePath = incompletePaths.pop();
            if (incompletePath[0].signature === '…') {
                completePaths.push(incompletePath);
                continue;
            }
            
            let longer = incompletePath[0].lessSpecific.map(parent => {
                return [].concat(parent, incompletePath);
            });
            incompletePaths.push.apply(incompletePaths, longer);
        }
        return completePaths;
    });

    allRules.forEach((rule, i) => {
        console.log(`Ending at ${rule.signature}:`);
        x[i].forEach(path => {
            let steps = path.map(step => step.signature);
            console.log(`  ${steps.join(' ==> ')}`);
        });
    });
}
