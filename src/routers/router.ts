'use strict';
import * as assert from 'assert';
import Handler, {Downstream} from '../handlers/handler';
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
        makeAllExecuteFunctions(allRoutes, allRules);
        this.allRules = allRules;
        this.allRoutes = allRoutes;


// TODO: restore...
//         // Ensure each decorator appears only once in the DAG
//         // TODO: this is more restrictive that necessary. Better way?
//         // let dupliDecors = Object.keys(allNodes).filter(key => allNodes[key].handler.isDecorator && allNodes[key].lessSpecialized.length > 1);
//         // assert(dupliDecors.length === 0, `split decorators: '${dupliDecors.join("', '")}'`); // TODO: improve error message
    }


    // TODO: doc...
    dispatch(request: Request): Response {
        // TODO: ...

        let pathname = typeof request === 'string' ? request : request.pathname;
        let path: Route[] = [];
        let route = this.allRoutes['…']; // matches all pathnames; don't need to check this against pathname

        while (true) {
            path.push(route);
            let rule = this.allRules[route.signature];

            let foundChild: Route = null;
            for (let i = 0; !foundChild && i < rule.moreSpecific.length; ++i) {
                let child = this.allRoutes[rule.moreSpecific[i]];
                foundChild = child.quickMatch(pathname) && child;
            }

            if (!foundChild) break;

            route = foundChild;
        }

        // TODO: temp testing...
        let response = route.execute(request);
        return response;

        // // should have a path here...
        // let fullPath = path.map(n => n.signature).join('   ==>   ');
        // //debugger;
        // return null;
    }
    

    // TODO: doc...
    private allRules: {[pattern: string]: Rule};
    private allRoutes: {[pattern: string]: Route};
}





// TODO: ...
interface Rule {
    signature: string;
    lessSpecific: string[];
    moreSpecific: string[];
    handlers: Handler[];
}





// TODO: ...
interface Route {
    signature: string;
    quickMatch: (pathname: string) => boolean;
    execute: (request: Request) => Response;
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
        mapPatternsToRules(patterns[pattern], getHandlersFor, childRule, allRules); // Recurse!
        if (!parentRule) return;
        childRule.lessSpecific.push(parentRule.signature);
        parentRule.moreSpecific.push(pattern);
    });
    return allRules;
}





// TODO: ...
function mapRulesToRoutes(rules: {[pattern:string]: Rule}, allRoutes?: {[pattern:string]: Route}) {
    allRoutes = allRoutes || {};
    Object.keys(rules).forEach(pattern => {
        let rule = rules[pattern];
        allRoutes[pattern] = {
            signature: rule.signature, // TODO: need?
            quickMatch: makeQuickMatchFunction(rule),
            execute: null
        };
    });
    return allRoutes;
}





// TODO: ...
function makeQuickMatchFunction(rule: Rule) {
    let quickMatchPattern = new Pattern(rule.signature);
    let isMatch = (pathname: string) => quickMatchPattern.match(pathname) !== null;
    return isMatch;
}





// TODO: ... remove?
function makeExecuteFunction(rule: Rule) {
    let result: (request: Request) => Response;

    // TODO: ...
    let downstream = {
        execute: () => null,
        candidates: { length: 0 }
    };

    result = req => rule.handlers[0].execute(req, downstream);

    return result;
}





//TODO: ...
// TODO: analyse and factor out/memoize repeated calculations/closures below...
function makeAllExecuteFunctions(allRoutes: {[pattern: string]: Route}, allRules: {[pattern: string]: Rule}) {
    Object.keys(allRoutes).forEach(pattern => {
        let route = allRoutes[pattern];
        let rule = allRules[pattern];

        let incompletePaths: Rule[][] = [[rule]];
        let completePaths: Rule[][] = [];
        while (incompletePaths.length > 0) {
            let incompletePath = incompletePaths.pop();
            if (incompletePath[0].signature === '…') {
                completePaths.push(incompletePath);
                continue;
            }

            let longer = incompletePath[0].lessSpecific.map(parent => {
                return [].concat(allRules[parent], incompletePath);
            });
            incompletePaths.push.apply(incompletePaths, longer);
        }
        //return completePaths;

        // TODO: handle multiple paths properly... for now just execute the best matching rule and then fall back to 'ambiguous' failure
        let completePath: Rule[];
        if (completePaths.length > 1) {
            //assert(completePaths.length === 1, `Not implemented: multiple paths to route`);
            completePath = [
                {
                    signature: '…',
                    lessSpecific: [],
                    moreSpecific: [rule.signature],
                    handlers: [
                        // TODO: temp... fix this...
                        // for now just execute the best matching rule and then fall back to this 'ambiguous' failure handler
                        new Handler(new Pattern('…'), () => { throw new Error('ambiguous - which fallback?'); })
                    ]
                },
                rule
            ];            
        }
        else {
            completePath = completePaths[0];
        }

        // TODO: compose all the handlers along the path into an 'execute' function
        let downstream: Downstream = { // Sentinel value - should make this a singleton somewhere
            execute: (req, index) => null,
            candidates: {length: 0}
        };
        //let execute: (request: Request) => Response = null;


        while (completePath.length > 0) {
            let rule = completePath.pop();

            // TODO: fail if a path has multiple handlers for now... address this case later...
            //assert(rule.handlers.length <= 1, `Not implemented: multiple handlers for path`);

            //let handler = rule.handlers[0] || { execute: (r, d) => d.execute(r) }; // no handler === handler that just does downstream
            let handlers = rule.handlers;
            let ds = downstream; // capture in loop

            downstream = {
                execute: (request, index) => {
                    // TODO: fix logic...
                    let handler: Handler;
                    if (index === void 0) {
                        // no `index` argument provided
                        if (handlers.length === 0) {
                            // no handlers - make a handler that returns the 'unhandled' sentinel
                            // TODO: memoize this one
                            handler = <any> { execute: () => null };
                        }
                        else {
                            // Ensure there is exactly one handler available. Else fail.
                            // TODO: proper way to fail?
                            assert(handlers.length === 1, `ambiguous - which handler?`);
                            handler = handlers[0];
                        }
                    }
                    else {
                        assert(index >= 0 && index < handlers.length, `index out of range`);
                        handler = handlers[index];
                    }
                    return handler.execute(request, ds);
                },
                candidates: { length: handlers.length }
            };
        }

        route.execute = downstream.execute;
    });





    // allRules.forEach((rule, i) => {
    //     console.log(`Ending at ${rule.signature}:`);
    //     x[i].forEach(path => {
    //         let steps = path.map(step => step.signature);
    //         console.log(`  ${steps.join(' ==> ')}`);
    //     });
    // });
}




function makeDownstreamObject() {
    if ('leaf rule') {
        // use singleton 'unhandled' downstream object
    }
    else {
        // non-leaf rule

        // downstream first        
        
    }
    
}
