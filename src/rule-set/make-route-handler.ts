'use strict';
import * as assert from 'assert';
import * as util from '../util';
import {Handler} from './types';
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
export default function makeRouteHandler(route: Rule[]): Handler {

    // TODO: fix comments below...
    // List the route's rules from most- to least-specific.
    // Generate a unique pretty name for each rule, suitable for use in generated code.
    // Partition the rules into sublists as described in the JSDoc comments above.
    // TODO: explain augmentation/partitioning...
    //let rules = augmentRules(route);
    let rules = route.slice().reverse();

    // TODO: doc...
    let ruleNames: string[] = rules
        .map(rule => `_${rule.pattern.toIdentifierParts()}`)
        .reduce((names, name) => names.concat(`${name}${names.indexOf(name) === -1 ? '' : `_${names.length}`}`), []);

    // TODO: doc...
    let startRuleName = ruleNames.filter((_, i) => rules[i].isDecorator).pop() || ruleNames[0];

    // TODO: doc...
    let lines = [
        ...ruleNames.map((name, i) => `var match${name} = rules[${i}].pattern.match;`),
        ...ruleNames.map((name, i) => `var handle${name} = rules[${i}].handler;`),
        'function _Ø(addr, req) {\n    return null;\n}',
        generateRuleHandlerSourceCode(rules, ruleNames),
        `return ${startRuleName};`
    ];

// if (rules.length > 5) {
//     console.log('\n\n\n\n\n');
//     console.log(lines.join('\n').split('\n'));
//     debugger;
// }

    // TODO: review comment below, originally from normalize-handler.ts...
    // TODO: add a similar comment to make-dispatcher.ts?
    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.

    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
    return fn;
}





// TODO: doc...
function generateRuleHandlerSourceCode(rules: Rule[], ruleNames: string[]): string {

    // TODO: doc...
    let sources = rules.map((rule, i) => {

        // TODO: fix these messes... explain 'downstream'
        let ruleName = ruleNames[i];
        let nextRuleName = ruleNames[i + 1];
        let downstreamRuleName = ruleNames.filter((n, j) => (j === 0 || rules[j].isDecorator) && j < i).pop() || '_Ø';
        let startsPartition = i === 0 || rule.isDecorator;
        let endsPartition = i === rules.length - 1 || rules[i + 1].isDecorator;

        // TODO: ...
        let paramNames = rule.parameterNames;
        let captureNames = rule.pattern.captureNames;
        let paramMappings = captureNames.reduce((map, name) => (map[name] = `captures${ruleName}.${name}`, map), {});
        let builtinMappings = { $addr: 'addr', $req: 'req', $next: `rq => ${downstreamRuleName}(addr, rq === void 0 ? req : rq)` };
        const handlerArgs = paramNames.map(name => paramMappings[name] || builtinMappings[name]).join(', ');

        // TODO: ...
        let source = `
            function ${ruleName}(addr, req, res?) {
                if (res !== null) return res;                                               #if ${!startsPartition}
                var captures${ruleName} = match${ruleName}(addr);                           #if ${!!captureNames.length}
                var res = handle${ruleName}(${handlerArgs});                                #if ${!endsPartition}
                if (isPromise(res)) return res.then(rs => ${nextRuleName}(addr, req, rs));  #if ${!endsPartition}
                return ${nextRuleName}(addr, req, res);                                     #if ${!endsPartition}
                return handle${ruleName}(${handlerArgs});                                   #if ${endsPartition}
            }
        `;

        // Strip off superfluous lines and indentation.
        source = source.split(/[\r\n]+/).slice(1, -1).join('\n');
        let indent = source.match(/^[ ]+/)[0].length;
        source = source.split('\n').map(line => line.slice(indent)).join('\n');

        // Conditionally keep/discard whole lines according to #if directives.
        source = source.replace(/^(.*?)([ ]+#if true)$/gm, '$1').replace(/\n.*?[ ]+#if false/g, '');

        // The first rule in each partition doesn't have a 'res' parameter. Adjust accordingly.
        source = source.replace(', res?', startsPartition ? '' : ', res');
        source = source.replace('var res', startsPartition ? 'var res' : 'res');

        // TODO: return the lines...
        return source;
    });

    // TODO: doc...
    return sources.join('\n');
}
