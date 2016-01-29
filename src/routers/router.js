'use strict';
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
        this.allRoutes = allRoutes;
        this.rootRoute = allRoutes['…'];
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
        let route = this.rootRoute; // always starts with '…'; don't need to check this against pathname
        while (true) {
            path.push(route);
            let foundChild = null;
            for (let i = 0; !foundChild && i < route.moreSpecific.length; ++i) {
                let child = this.allRoutes[route.moreSpecific[i]];
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
function traceAllRoutes(rootRule, allRules) {
    var x = allRules.map(rule => {
        let incompletePaths = [[rule]];
        let completePaths = [];
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
            moreSpecific: rule.moreSpecific,
            quickMatch: makeQuickMatchFunction(rule),
            execute: makeExecuteFunction(rule)
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
// TODO: ...
function makeExecuteFunction(rule) {
    let result;
    // TODO: ...
    result = req => rule.handlers[0].execute(req, () => null);
    return result;
}
//# sourceMappingURL=router.js.map