'use strict';
import * as assert from 'assert';
import {Handler, PartialHandler, GeneralHandler, Route, Rule} from './types';
import isPartialHandler from './is-partial-handler';
import makePatternIdentifier from './make-pattern-identifier';





export default function makeRouteHandler(route: Route): Handler {

    // TODO: specific to general...
    let rules = route.slice().reverse();

    // TODO: doc...
    let handlerIds = makeHandlerIdentifiers(rules);

    let lines = [
        ...rules.map((rule, i) => `var handle${handlerIds.get(rule)} = rules[${i}].handler;`),
        '',
        'function no_downstream(req) { return null; }',
        '',
        `return function route${handlerIds.get(rules[0])}(address, request) {`,
        ...getBodyLines(rules, handlerIds).map(line => `    ${line}`),
        '};'
    ];
// console.log(lines);
// debugger;


    let fn = eval(`(() => {\n${lines.join('\n')}\n})`)();
//console.log(`\n\n\n\n\n${fn.toString()}`);
//debugger;
    return fn;
}





// TODO: doc...
function getBodyLines(rules: Rule[], handlerIds: Map<Rule, string>): string[] {


    let rules2 = rules.slice();
    let body2 = [`var addr = address, req = request, res;`];
    let lines2: string[] = [];
    let downstreamRule: Rule;


    // TODO: Iterate over rules, from most to least specific
    while (rules2.length > 0) {


        if (!isPartialHandler(rules2[0].handler)) {

            if (lines2.length > 0) {

                body2 = [
                    ...body2,
                    `function downstream_of${handlerIds.get(downstreamRule)}(req) {`,
                    `    if (req === void 0) req = request;`,
                    ...lines2.map(line => `    ${line}`),
                    `}`
                ];
                lines2 = [];
            }
// 
//             else {
//                 // TODO: Only need a singleton nullHandler!!
//                 body2.push(`function no_downstream(req) { return null; }`);
//             }
        }


        let runCount = rules2.slice(1).findIndex(rule => !isPartialHandler(rule.handler)) + 1;
        if (runCount === 0) runCount = rules2.length;


        let run = rules2.slice(0, runCount);
        rules2 = rules2.slice(runCount);


        while (run.length > 0) {
            let rule = run.shift();
            let downstream = isPartialHandler(rule.handler) ? '' : `, ${downstreamRule ? `downstream_of${handlerIds.get(downstreamRule)}` : 'no_downstream'}`;
            let pre = run.length > 0 ? `if ((res = ` : `return `;
            let post = run.length > 0 ? `) !== null) return res;` : `;`;
            lines2.push(`${pre}handle${handlerIds.get(rule)}(addr, req${downstream})${post}`);
            if (run.length === 0) downstreamRule = rules2[0];
        }
       
    }
    body2 = body2.concat(lines2);


//console.log('\n\n\n\n\n');
//console.log(body2);
//debugger;
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
