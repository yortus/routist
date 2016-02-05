'use strict';
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
var rule_1 = require('../rules/rule');
// temp testing...
var router2_1 = require('./router2');
var make_decision_tree_1 = require('./make-decision-tree');
// TODO: doc...
var Router = (function () {
    // TODO: doc...
    function Router() {
    }
    // TODO: doc...
    Router.prototype.add = function (routeTable) {
        var patternHierarchy = hierarchize_patterns_1.default(Object.keys(routeTable).map(function (key) { return new pattern_1.default(key); }));
        var finalHandlers = router2_1.default(routeTable); // TODO: fix terminology: 'handler' is taken...
        var makeDecision = make_decision_tree_1.default(patternHierarchy);
        this.dispatch = function (request) {
            var address = typeof request === 'string' ? request : request.address;
            var signature = makeDecision(address);
            var handler = finalHandlers[signature];
            var response = handler(request);
            return response;
        };
    };
    // TODO: doc...
    Router.prototype.dispatch = function (request) {
        throw new Error("Not ready!!! Call add first..."); // TODO: fix this...
    };
    ;
    return Router;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
// TODO: ... this should be configurable and stackable
function isSpecializationOf(special, general) {
    return null;
}
// TODO: ...
function mapPatternsToRuleNodes(patterns, getRulesFor, parentRuleNode, allRuleNodes) {
    allRuleNodes = allRuleNodes || {};
    Object.keys(patterns).forEach(function (pattern) {
        // TODO: get all rules with the same signature. These must all be mutually disambiguated into a definite gen>spec order.
        var rules = getRulesFor(pattern);
        rules.sort(function (a, b) {
            var isAMoreSpecific = isSpecializationOf(a, b);
            var isBMoreSpecific = isSpecializationOf(b, a);
            if (isAMoreSpecific === true && isBMoreSpecific === false)
                return 1;
            if (isBMoreSpecific === true && isAMoreSpecific === false)
                return -1;
            // TODO: proper handling?
            throw new Error("ambiguous: " + a.pattern + " vs " + b.pattern);
        });
        var childRule = allRuleNodes[pattern] || (allRuleNodes[pattern] = {
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
    Object.keys(rules).forEach(function (pattern) {
        var rule = rules[pattern];
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
    var quickMatchPattern = new pattern_1.default(rule.signature);
    var isMatch = function (address) { return quickMatchPattern.match(address) !== null; };
    return isMatch;
}
// TODO: ... remove?
// function makeExecuteFunction(rule: RuleNode) {
//     let result: (request: Request) => Response;
// 
//     // TODO: ...
//     let downstream = {
//         execute: () => null,
//         candidates: { length: 0 }
//     };
// 
//     result = req => rule.juxtaposedRules[0].execute(req, downstream);
// 
//     return result;
// }
//TODO: ...
// TODO: analyse and factor out/memoize repeated calculations/closures below...
function makeAllExecuteFunctions(allRoutes, allRules) {
    Object.keys(allRoutes).forEach(function (pattern) {
        var route = allRoutes[pattern];
        var ruleNode = allRules[pattern];
        var incompletePaths = [[ruleNode]];
        var completePaths = [];
        var _loop_1 = function() {
            var incompletePath = incompletePaths.pop();
            if (incompletePath[0].signature === '…') {
                completePaths.push(incompletePath);
                return "continue";
            }
            var longer = incompletePath[0].lessSpecific.map(function (parent) {
                return [].concat(allRules[parent], incompletePath);
            });
            incompletePaths.push.apply(incompletePaths, longer);
        };
        while (incompletePaths.length > 0) {
            var state_1 = _loop_1();
            if (state_1 === "continue") continue;
        }
        //return completePaths;
        // TODO: handle multiple paths properly... for now just execute the best matching rule and then fall back to 'ambiguous' failure
        var completePath;
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
                        new rule_1.default(new pattern_1.default('…'), function () { throw new Error('ambiguous - which fallback?'); })
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