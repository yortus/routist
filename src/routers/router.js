'use strict';
var handler_1 = require('../handlers/handler');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var mapGraph_1 = require('./mapGraph');
var pattern_1 = require('../patterns/pattern');
var rule_node_1 = require('./rule-node');
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
        // TODO: add root pattern/handler if not there already
        if (!patterns.some(p => p.signature === '…')) {
            let rootPattern = new pattern_1.default('…');
            patterns.push(rootPattern);
            handlers.push(new handler_1.default(rootPattern, () => { throw new Error('404!'); })); // TODO: proper handler?
        }
        // TODO: ...
        let patternHierarchy = hierarchize_patterns_1.default(patterns);
        debugger;
        let allRules = [];
        var ruleHierarchy = mapGraph_1.default(patternHierarchy, {
            addNode: (value, key) => {
                if (!key)
                    return -1;
                let rule = new rule_node_1.default(key || '');
                return allRules.push(rule) - 1;
            },
            addEdge: (parent, child) => {
                if (parent === -1)
                    return;
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
            let route = {
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
//# sourceMappingURL=router.js.map