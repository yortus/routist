'use strict';
import * as assert from 'assert';
import {getFunctionParameterNames} from '../util';
import {Handler, Route} from './types';
import makePatternIdentifier from './make-pattern-identifier';
import Rule from './rule';





export default function makeRouteHandler<TRequest, TResponse>(route: Route): Handler<TRequest, TResponse> {

    // TODO: specific to general...
    let rules = route.slice().reverse();

    // TODO: doc...
    let handlerIds = makeHandlerIdentifiers(rules);

    let lines = [
        ...rules.map((rule, i) => `var match${handlerIds.get(rule)} = rules[${i}].pattern.match;`).filter((_, i) => rules[i].pattern.captureNames.length > 0), // TODO: line too long!!!
        ...rules.map((rule, i) => `var handle${handlerIds.get(rule)} = rules[${i}].handler;`),
        '',
        'function no_downstream(req) { return null; }',
        '',
        `return function route${handlerIds.get(rules[0])}(address, request) {`,
        ...getBodyLines(rules, handlerIds).map(line => `    ${line}`),
        '};'
    ];
//console.log(lines);
//debugger;

    // TODO: review comment bwloe, originally from normalize-handler.ts...
    // TODO: add a similar comment to make-dispatcher.ts?
    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.

    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
console.log(`\n\n\n\n\n${fn.toString()}`);
//debugger;
    return fn;
}





// TODO: doc...
function getBodyLines(rules: Rule[], handlerIds: Map<Rule, string>): string[] {


    let rules2 = rules.slice();
    let body2 = [`var req = request, res, captures;`, '']; // TODO: think about deopt due to 'captures' being re-used with different props...
    let lines2: string[] = [];
    let downstreamRule: Rule;


    // TODO: Iterate over rules, from most to least specific
    while (rules2.length > 0) {


        if (rules2[0].isDecorator) {

            if (lines2.length > 0) {

                body2 = [
                    ...body2,
                    `function downstream_of${handlerIds.get(downstreamRule)}(req) {`,
                    ...lines2.map(line => `    ${line}`),
                    `}`,
                    ''
                ];
                lines2 = [];
            }
        }


        let runCount = rules2.slice(1).findIndex(rule => rule.isDecorator) + 1;
        if (runCount === 0) runCount = rules2.length;


        let run = rules2.slice(0, runCount);
        rules2 = rules2.slice(runCount);


        while (run.length > 0) {
            let rule = run.shift();

            let paramNames = getFunctionParameterNames(rule.handler);
            let captureNames = rule.pattern.captureNames;
            let paramMappings = captureNames.reduce((map, name) => (map[name] = `captures.${name}`, map), {});
            if (captureNames.length > 0) lines2.push(`captures = match${handlerIds.get(rule)}(address);`);
            let builtinMappings = {
                $addr: 'address',
                $req: 'req === void 0 ? request : req',
                $next: `${downstreamRule ? `downstream_of${handlerIds.get(downstreamRule)}` : 'no_downstream'}`
            };


            // TODO: restore the following check originally from normalize-handler.ts
            // sanity check: ensure all builtins are mapped
            //assert(builtinNames.every(bname => !!builtinMappings[bname]));


            let call = `handle${handlerIds.get(rule)}(${paramNames.map(name => paramMappings[name] || builtinMappings[name]).join(', ')})`;

            if (run.length > 0) {
                lines2.push(`res = ${call};`);
                lines2.push(`if (res !== null) return res;`);
                lines2.push('');
            }
            else {
                lines2.push(`return ${call};`);
                downstreamRule = rules2[0];
            }
        }
    }
    body2 = body2.concat(lines2);
    return body2;
}





// TODO: doc...
function makeHandlerIdentifiers(rules: Rule[]) {
    let reservedIds = new Set<string>();
    let result = rules.reduce(
        (map, rule) => {

            // TODO: ...
            let base = makePatternIdentifier(rule.pattern);
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
