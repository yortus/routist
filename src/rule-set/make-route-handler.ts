'use strict';
import * as assert from 'assert';
import * as util from '../util';
import {Handler, Route} from './types';
import Rule from './rule';
let isPromise = util.isPromise; // TODO: explain why this... (eval and TS module var renaming)





// TODO: doc...
export default function makeRouteHandler<TRequest, TResponse>(route: Route): Handler<TRequest, TResponse> {

    // TODO: specific to general...
    let rules = route.slice().reverse();

    // TODO: ...
    let ruleGroups = partitionRulesIntoGroups(rules);

    // TODO: doc...
    let handlerIds = makeHandlerIdentifiers(rules);

    // TODO: ...
    let outerLines: string[] = [];
    ruleGroups.forEach((group, gi) => {
        group.forEach((rule, ri) => {
            outerLines.push(...getRuleLines(ruleGroups, gi, ri, handlerIds));
        });
    });

    // TODO: ...
    let inner = getRuleLines(ruleGroups, ruleGroups.length - 1, 0, handlerIds).slice(1, -1).map(line => line.slice(4))

    // TODO: ...
    let startRule = ruleGroups[ruleGroups.length - 1][0];

    // TODO: doc...
    let lines = [
        ...rules.map((rule, i) => `var match${handlerIds.get(rule)} = rules[${i}].pattern.match;`).filter((_, i) => rules[i].pattern.captureNames.length > 0), // TODO: line too long!!!
        ...rules.map((rule, i) => `var handle${handlerIds.get(rule)} = rules[${i}].handler;`),
        '',
        'function _Ø(req) { return null; }',
        ...outerLines,
        '',
        `return ${handlerIds.get(startRule)};`,
    ];
 //if (rules.length > 5) {
     console.log('\n\n\n\n\n');
     console.log(lines);
 //}
// debugger;

    // TODO: review comment bwloe, originally from normalize-handler.ts...
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
function partitionRulesIntoGroups(rules: Rule[]): Rule[][] {
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
function getRuleLines(ruleGroups: Rule[][], gi: number, ri: number, handlerIds: Map<Rule, string>): string[] {

    // TODO: ...
    let group = ruleGroups[gi];
    let rule = group[ri];
    let hid = handlerIds.get(rule);
    let paramNames = rule.parameterNames;
    let captureNames = rule.pattern.captureNames;
    let paramMappings = captureNames.reduce((map, name) => (map[name] = `captures${hid}.${name}`, map), {});
    let builtinMappings = {
        $addr: 'addr',
        $req: 'req',
        $next: `${gi === 0 ? '_Ø' : `rq => ${handlerIds.get(ruleGroups[gi - 1][0])}(addr, rq === void 0 ? req : rq)`}`
    };
    let isFirstInGroup = ri === 0;
    let isLastInGroup = ri === group.length - 1;

    // TODO: ...
    let lines: string[] = [];

    // TODO: ...
    lines.push(`function ${hid}(addr, req${isFirstInGroup ? '' : ', res'}) {`);

    // TODO: ...
    if (!isFirstInGroup) lines.push(`    if (res !== null) return res;`);

    // TODO: ...
    if (captureNames.length > 0) lines.push(`    var captures${hid} = match${hid}(addr);`);
    let call = `handle${hid}(${paramNames.map(name => paramMappings[name] || builtinMappings[name]).join(', ')})`;

    // TODO: ...
    if (!isLastInGroup) {
        lines.push(`    ${isFirstInGroup ? 'var ' : ''}res = ${call};`);
        lines.push(`    if (isPromise(res)) return res.then(rs => ${handlerIds.get(group[ri + 1])}(addr, req, rs));`);
        lines.push(`    return ${handlerIds.get(group[ri + 1])}(addr, req, res);`);
    }
    else {
        lines.push(`    return ${call};`);
    }

    lines.push('}');
    return lines;
}





// TODO: doc...
function makeHandlerIdentifiers(rules: Rule[]) {
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
