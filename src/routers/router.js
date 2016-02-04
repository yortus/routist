'use strict';
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
var rule_1 = require('../rules/rule');
// TODO: doc...
class Router {
    // TODO: doc...
    constructor() {
    }
    add(arg) {
        // Construct flat lists of all the patterns and handlers for the given rules.
        let patterns;
        let rules;
        if (Array.isArray(arg)) {
            patterns = arg.map(pair => new pattern_1.default(pair[0]));
            rules = arg.map((pair, i) => new rule_1.default(patterns[i], pair[1]));
        }
        else {
            let keys = Object.keys(arg);
            patterns = keys.map(key => new pattern_1.default(key));
            rules = keys.map((key, i) => new rule_1.default(patterns[i], arg[key]));
        }
        // TODO: ...
        function getRulesForPattern(patternSignature) {
            return rules.filter((_, i) => patterns[i].signature === patternSignature);
        }
        // TODO: add root pattern and rule if not there already
        if (!patterns.some(p => p.signature === '…')) {
            let rootPattern = new pattern_1.default('…');
            patterns.push(rootPattern);
            rules.push(new rule_1.default(rootPattern, () => { throw new Error('404!'); })); // TODO: proper handler?
        }
        // TODO: ...
        let patternHierarchy = hierarchize_patterns_1.default(patterns);
        let allRuleNodes = mapPatternsToRuleNodes(patternHierarchy, getRulesForPattern);
        let allRoutes = mapRuleNodesToRoutes(allRuleNodes);
        makeAllExecuteFunctions(allRoutes, allRuleNodes);
        this.allRuleNodes = allRuleNodes;
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
        let address = typeof request === 'string' ? request : request.address;
        let path = [];
        let route = this.allRoutes['…']; // matches all addresses; don't need to check this against address
        while (true) {
            path.push(route);
            let rule = this.allRuleNodes[route.signature];
            let foundChild = null;
            for (let i = 0; !foundChild && i < rule.moreSpecific.length; ++i) {
                let child = this.allRoutes[rule.moreSpecific[i]];
                foundChild = child.quickMatch(address) && child;
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
// TODO: ... this should be configurable and stackable
function isSpecializationOf(special, general) {
    return null;
}
// TODO: ...
function mapPatternsToRuleNodes(patterns, getRulesFor, parentRuleNode, allRuleNodes) {
    allRuleNodes = allRuleNodes || {};
    Object.keys(patterns).forEach(pattern => {
        // TODO: get all rules with the same signature. These must all be mutually disambiguated into a definite gen>spec order.
        let rules = getRulesFor(pattern);
        rules.sort((a, b) => {
            let isAMoreSpecific = isSpecializationOf(a, b);
            let isBMoreSpecific = isSpecializationOf(b, a);
            if (isAMoreSpecific === true && isBMoreSpecific === false)
                return 1;
            if (isBMoreSpecific === true && isAMoreSpecific === false)
                return -1;
            // TODO: proper handling?
            throw new Error(`ambiguous: ${a.pattern} vs ${b.pattern}`);
        });
        let childRule = allRuleNodes[pattern] || (allRuleNodes[pattern] = {
            signature: pattern,
            lessSpecific: [],
            moreSpecific: [],
            juxtaposedRules: getRulesFor(pattern)
        });
        mapPatternsToRuleNodes(patterns[pattern], getRulesFor, childRule, allRuleNodes); // Recurse!
        if (!parentRuleNode)
            return;
        childRule.lessSpecific.push(parentRuleNode.signature);
        parentRuleNode.moreSpecific.push(pattern);
    });
    return allRuleNodes;
}
// TODO: ...
function mapRuleNodesToRoutes(rules, allRoutes) {
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
    let isMatch = (address) => quickMatchPattern.match(address) !== null;
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
    result = req => rule.juxtaposedRules[0].execute(req, downstream);
    return result;
}
//TODO: ...
// TODO: analyse and factor out/memoize repeated calculations/closures below...
function makeAllExecuteFunctions(allRoutes, allRules) {
    Object.keys(allRoutes).forEach(pattern => {
        let route = allRoutes[pattern];
        let ruleNode = allRules[pattern];
        let incompletePaths = [[ruleNode]];
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
                    moreSpecific: [ruleNode.signature],
                    juxtaposedRules: [
                        // TODO: temp... fix this...
                        // for now just execute the best matching rule and then fall back to this 'ambiguous' failure handler
                        new rule_1.default(new pattern_1.default('…'), () => { throw new Error('ambiguous - which fallback?'); })
                    ]
                },
                ruleNode
            ];
        }
        else {
            completePath = completePaths[0];
        }
        //         // TODO: compose all the handlers along the path into an 'execute' function
        //         let downstream: Downstream = { // Sentinel value - should make this a singleton somewhere
        //             execute: (req, index) => null,
        //             candidates: {length: 0}
        //         };
        //         //let execute: (request: Request) => Response = null;
        // 
        // 
        //         while (completePath.length > 0) {
        //             let ruleNode = completePath.pop();
        // 
        //             // TODO: fail if a path has multiple handlers for now... address this case later...
        //             //assert(rule.handlers.length <= 1, `Not implemented: multiple handlers for path`);
        // 
        //             //let handler = rule.handlers[0] || { execute: (r, d) => d.execute(r) }; // no handler === handler that just does downstream
        //             let rules = ruleNode.juxtaposedRules;
        //             let ds = downstream; // capture in loop
        // 
        //             downstream = {
        //                 execute: (request, index) => {
        //                     // TODO: fix logic...
        //                     let rule: Rule;
        //                     if (index === void 0) {
        //                         // no `index` argument provided
        //                         if (rules.length === 0) {
        //                             // no handlers - make a handler that returns the 'unhandled' sentinel
        //                             // TODO: memoize this one
        //                             rule = <any> { execute: () => null };
        //                         }
        //                         else {
        //                             // Ensure there is exactly one handler available. Else fail.
        //                             // TODO: proper way to fail?
        //                             assert(rules.length === 1, `ambiguous - which rule?`);
        //                             rule = rules[0];
        //                         }
        //                     }
        //                     else {
        //                         assert(index >= 0 && index < rules.length, `index out of range`);
        //                         rule = rules[index];
        //                     }
        //                     return rule.execute(request, ds);
        //                 },
        //                 candidates: { length: rules.length }
        //             };
        //         }
        //         route.execute = downstream.execute;
    });
}
function makeDownstreamObject() {
    if ('leaf rule') {
    }
    else {
    }
}
//# sourceMappingURL=router.js.map