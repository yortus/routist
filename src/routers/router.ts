'use strict';
import * as assert from 'assert';
import Handler from '../handlers/handler';
import hierarchizePatterns, {PatternNode} from '../patterns/hierarchize-patterns';
import Request from '../request';
import Response from '../response';
import Pattern from '../patterns/pattern';





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

        // TODO: ...
        function getHandlersForPattern(patternSignature: string) {
            return handlers.filter((h, i) => patterns[i].signature === patternSignature);
        }

        // TODO: add root pattern/handler if not there already
        if (!patterns.some(p => p.signature === '…')) {
            let rootPattern = new Pattern('…')
            patterns.push(rootPattern);
            handlers.push(new Handler(rootPattern, () => { throw new Error('404!');})); // TODO: proper handler?
        }

        // TODO: ...
        let patternHierarchy = hierarchizePatterns(patterns);
        let allRules = mapPatternsToRules(patternHierarchy, getHandlersForPattern);
        let allRoutes = mapRulesToRoutes(allRules);






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
function traceAllRoutes(rootRule: Rule, allRules: Rule[]) {
    var x = allRules.map(rule => {
        let incompletePaths: Rule[][] = [[rule]];
        let completePaths: Rule[][] = [];
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





// TODO: ...
interface Rule {
    signature: string;
    lessSpecific: string[];    
    moreSpecific: string[];
    handlers: Handler[];
}





// TODO: ...
function mapPatternsToRules(patterns: PatternNode, getHandlersFor: (pattern: string) => Handler[], parentRule?: Rule, allRules?: {[pattern:string]: Rule}) {
    allRules = allRules || {};
    Object.keys(patterns).forEach(pattern => {
        let childRule = allRules[pattern] || (allRules[pattern] = {
            signature: pattern,
            lessSpecific: [],
            moreSpecific: [],
            handlers: getHandlersFor(pattern)
        });
        mapPatternsToRules(patterns[pattern], getHandlersFor, childRule, allRules);
        if (!parentRule) return;
        childRule.lessSpecific.push(parentRule.signature);
        parentRule.moreSpecific.push(pattern);
    });
    return allRules;
}





// TODO: ...
function mapRulesToRoutes(rules: {[pattern:string]: Rule}) {
    let routes = Object.keys(rules).map(pattern => {
        let rule = rules[pattern];
        let route = {
            signature: rule.signature, // TODO: need?
            quickMatch: makeQuickMatchFunction(rule),
            moreSpecific: rule.moreSpecific,
            execute: makeExecuteFunction(rule)
        };
        return route;
    });
    return routes;
}





// TODO: ...
function makeQuickMatchFunction(rule: Rule) {
    let quickMatchPattern = new Pattern(rule.signature);
    let isMatch = (pathname: string) => quickMatchPattern.match(pathname) !== null;
    return isMatch;
}





// TODO: ...
function makeExecuteFunction(rule: Rule) {
    let result: (request: Request) => Response;
    // TODO: ...
    return result;
}
