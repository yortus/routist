'use strict';
var assert = require('assert');
var handler_1 = require('../handlers/handler');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
// TODO: doc...
class Router {
    // TODO: doc...
    constructor() {
    }
    add(routes) {
        // Construct flat lists of all the patterns and handlers for the given routes.
        let patterns;
        let handlers;
        if (Array.isArray(routes)) {
            patterns = routes.map(route => new pattern_1.default(route[0]));
            handlers = routes.map((route, i) => new handler_1.default(patterns[i], route[1]));
        }
        else {
            let keys = Object.keys(routes);
            patterns = keys.map(key => new pattern_1.default(key));
            handlers = keys.map((key, i) => new handler_1.default(patterns[i], routes[key]));
        }
        // TODO: ...
        function getHandlersForPattern(patternSignature) {
            return handlers.filter((h, i) => patterns[i].signature === patternSignature);
        }
        // TODO: add root pattern/handler if not there already
        if (!patterns.some(p => p.signature === '…')) {
            let rootPattern = new pattern_1.default('…');
            patterns.push(rootPattern);
            handlers.push(new handler_1.default(rootPattern, () => { throw new Error('404!'); })); // TODO: proper handler?
        }
        // TODO: ...
        let patternHierarchy = hierarchize_patterns_1.default(patterns);
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
    dispatch(request) {
        // TODO: ...
        let pathname = request.pathname;
        let path = [];
        let route = this.allRoutes['…']; // matches all pathnames; don't need to check this against pathname
        while (true) {
            path.push(route);
            let rule = this.allRules[route.signature];
            let foundChild = null;
            for (let i = 0; !foundChild && i < rule.moreSpecific.length; ++i) {
                let child = this.allRoutes[rule.moreSpecific[i]];
                foundChild = child.quickMatch(pathname) && child;
            }
            if (!foundChild)
                break;
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
// TODO: ...
function mapPatternsToRules(patterns, getHandlersFor, parentRule, allRules) {
    allRules = allRules || {};
    Object.keys(patterns).forEach(pattern => {
        let childRule = allRules[pattern] || (allRules[pattern] = {
            signature: pattern,
            lessSpecific: [],
            moreSpecific: [],
            handlers: getHandlersFor(pattern)
        });
        mapPatternsToRules(patterns[pattern], getHandlersFor, childRule, allRules); // Recurse!
        if (!parentRule)
            return;
        childRule.lessSpecific.push(parentRule.signature);
        parentRule.moreSpecific.push(pattern);
    });
    return allRules;
}
// TODO: ...
function mapRulesToRoutes(rules, allRoutes) {
    allRoutes = allRoutes || {};
    Object.keys(rules).forEach(pattern => {
        let rule = rules[pattern];
        allRoutes[pattern] = {
            signature: rule.signature,
            quickMatch: makeQuickMatchFunction(rule),
            execute: null
        };
    });
    return allRoutes;
}
// TODO: ...
function makeQuickMatchFunction(rule) {
    let quickMatchPattern = new pattern_1.default(rule.signature);
    let isMatch = (pathname) => quickMatchPattern.match(pathname) !== null;
    return isMatch;
}
// TODO: ... remove?
function makeExecuteFunction(rule) {
    let result;
    // TODO: ...
    let downstream = {
        execute: () => null,
        candidates: { length: 0 }
    };
    result = req => rule.handlers[0].execute(req, downstream);
    return result;
}
//TODO: ...
function makeAllExecuteFunctions(allRoutes, allRules) {
    Object.keys(allRoutes).forEach(pattern => {
        let route = allRoutes[pattern];
        let rule = allRules[pattern];
        let incompletePaths = [[rule]];
        let completePaths = [];
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
        let completePath;
        if (completePaths.length > 1) {
            //assert(completePaths.length === 1, `Not implemented: multiple paths to route`);
            completePath = [
                {
                    signature: '…',
                    lessSpecific: [],
                    moreSpecific: [rule.signature],
                    handlers: [
                        // TODO: temp... fix this...
                        new handler_1.default(new pattern_1.default('…'), () => { throw new Error('ambiguous'); })
                    ]
                },
                rule
            ];
        }
        else {
            completePath = completePaths[0];
        }
        // TODO: compose all the handlers along the path into an 'execute' function
        let downstream = {
            execute: (req, index) => null,
            candidates: { length: 0 }
        };
        //let execute: (request: Request) => Response = null;
        while (completePath.length > 0) {
            let rule = completePath.pop();
            // TODO: fail if a path has multiple handlers for now... address this case later...
            assert(rule.handlers.length <= 1, `Not implemented: multiple handlers for path`);
            let handler = rule.handlers[0] || { execute: (r, d) => d.execute(r) }; // no handler === handler that just does downstream
            let ds = downstream; // capture in loop
            downstream = {
                execute: (request, index) => handler.execute(request, ds),
                candidates: { length: 1 }
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
//# sourceMappingURL=router.js.map