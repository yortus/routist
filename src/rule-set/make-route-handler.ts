'use strict';
import * as assert from 'assert';
import * as util from '../util';
import {Handler, Route} from './types';
import Rule from './rule';
let isPromise = util.isPromise; // TODO: explain why this... (eval and TS module var renaming)





/**
 * In the absence of decorators, the logic of executing a route is fairly simple: execute the handler for each rule in
 * turn, from the most to least specific, until one produces a response. With decorators, the logic becomes more
 * complex, because a decorator must run *before* its more specfic handlers, with those more specific handlers being
 * wrapped into a callback function and passed to the decorator. To account for this, we perform an order-preserving
 * partitioning of a route's rules into a number of sublists, with each decorator starting a new partition. Within each
 * partition, the simple cascading logic outlined in the first sentence above is performed. However each partition is
 * executed in reverse-order (least to most specific), with the next (more-specific) partition being passed as the
 * $next parameter to the decorator starting previous (less-specific) partition.
 */




// TODO: doc...
export default function makeRouteHandler<TRequest, TResponse>(route: Route): Handler<TRequest, TResponse> {

    // List the route's rules from most- to least-specific.
    let rules = route.slice().reverse();

    // Generate a unique pretty name for each rule, suitable for use in generated code.
    let ruleNames = generateRuleNames(rules.concat(emptyRule)); // TODO: explain adding emptyRule here...

    // Partition the rules into sublists as described in the JSDoc comments above.
    let partitions = partitionRules(rules);

    // TODO: ...
    let outerLines: string[] = [];
    let downstreamRule = null, firstRuleInPartition = emptyRule;
    rules.forEach((rule, i) => {
        let isFirstInPartition = i === 0 || rule.isDecorator;
        if (isFirstInPartition) {
            // TODO: shunt...
            downstreamRule = firstRuleInPartition;
            firstRuleInPartition = rule;
        }
        let nextRuleInPartition = i < rules.length - 1 && !rules[i + 1].isDecorator ? rules[i + 1] : null;
        outerLines.push(...getRuleLines(rule, isFirstInPartition, nextRuleInPartition, ruleNames.get(downstreamRule), ruleNames));
    });

    // TODO: ...
    let startRule = partitions[partitions.length - 1][0];

    // TODO: doc...
    let lines = [
        ...rules.map((rule, i) => `var match${ruleNames.get(rule)} = rules[${i}].pattern.match;`),
        ...rules.map((rule, i) => `var handle${ruleNames.get(rule)} = rules[${i}].handler;`),
        '',
        'function _Ø(req) { return null; }',
        ...outerLines,
        '',
        `return ${ruleNames.get(startRule)};`,
    ];
// if (rules.length > 5) {
//     console.log('\n\n\n\n\n');
//     console.log(lines);
//     debugger;
// }

    // TODO: review comment below, originally from normalize-handler.ts...
    // TODO: add a similar comment to make-dispatcher.ts?
    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.

    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
//if (rules.length > 5) {
//    console.log(`\n\n\n\n\n${fn.toString()}`);
//}
//debugger;
    return fn;
}





// TODO: doc...
let emptyRule = new Rule('∅', () => null);






// TODO: doc...
function partitionRules(rules: Rule[]): Rule[][] {
    return rules.reduce(
        (groups, rule, i) => {
            // Each decorator starts a new group
            if (rule.isDecorator && i > 0) groups.push([]);

            // Add the rule to the current group
            groups[groups.length - 1].push(rule);
            return groups;
        },
        <Rule[][]>[[]]
    );
}





// TODO: doc...
function getRuleLines(rule: Rule, isFirstInPartition: boolean, nextRuleInPartition: Rule, downstreamFuncName: string, ruleNames: Map<Rule, string>): string[] {

    // TODO: ...
    let ruleName = ruleNames.get(rule);
    let nextRuleName = ruleNames.get(nextRuleInPartition);
    let isLastInPartition = nextRuleInPartition === null;

    // TODO: ...
    let paramNames = rule.parameterNames;
    let captureNames = rule.pattern.captureNames;
    let paramMappings = captureNames.reduce((map, name) => (map[name] = `captures${ruleName}.${name}`, map), {});
    let builtinMappings = { $addr: 'addr', $req: 'req', $next: `rq => ${downstreamFuncName}(addr, rq === void 0 ? req : rq)` };
    const handlerArgs = paramNames.map(name => paramMappings[name] || builtinMappings[name]).join(', ');






    // TODO: ...
    let src = `
        function ${ruleName}(addr, req, res?) {
            if (res !== null) return res;                                               #if ${!isFirstInPartition}
            var captures${ruleName} = match${ruleName}(addr);                           #if ${captureNames.length > 0}
            var res = handle${ruleName}(${handlerArgs});                                #if ${!isLastInPartition}
            if (isPromise(res)) return res.then(rs => ${nextRuleName}(addr, req, rs));  #if ${!isLastInPartition}
            return ${nextRuleName}(addr, req, res);                                     #if ${!isLastInPartition}
            return handle${ruleName}(${handlerArgs});                                   #if ${isLastInPartition}
        }
    `;

    // Strip off superfluous lines and indentation.
    src = src.split(/[\r\n]+/).slice(1, -1).join('\n');
    let indent = src.match(/^[ ]+/)[0].length;
    src = src.split('\n').map(line => line.slice(indent)).join('\n');

    // Conditionally keep/discard whole lines according to #if directives.
    src = src.replace(/^(.*?)([ ]+#if true)$/gm, '$1').replace(/\n.*?[ ]+#if false/g, '');

    // The first rule in each partition doesn't have a 'res' parameter. Adjust accordingly.
    src = src.replace(', res?', isFirstInPartition ? '' : ', res');
    src = src.replace('var res', isFirstInPartition ? 'var res' : 'res');

    // TODO: return the lines...
    return src.split('\n');
}





// TODO: doc... explain possibility of two rules having the same name and how this is avoided
function generateRuleNames(rules: Rule[]) {
    let reservedIds = new Set<string>();
    let result = rules.reduce(
        (map, rule) => {

            // TODO: ...
            let base = rule.pattern.toIdentifierParts();
            for (let isReserved = true, index = 0; isReserved; ++index) {
                var id = `_${base}${index ? `_${index}` : ''}`;
                isReserved = reservedIds.has(id);
            }
            
            // TODO: ...
            reservedIds.add(id);
            return map.set(rule, id);
        },
        new Map<Rule, string>()
    );
    return result;
}
