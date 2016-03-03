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
// if (rules.length > 5) {
//     console.log(lines);
// }
// debugger;

    // TODO: review comment bwloe, originally from normalize-handler.ts...
    // TODO: add a similar comment to make-dispatcher.ts?
    // Evaluate the source code into a function, and return it. This use of eval here is safe. In particular, the
    // values in `paramNames` and `paramMappings`, which originate from client code, have been effectively sanitised
    // through the assertions made by `validateNames`. The evaled function is fast and suitable for use on a hot path.

try {
        /*let*/var fn = eval(`(() => {\n${lines.join('\n')}\n})`)(); // TODO: change var to let
}
catch (ex) {
    console.log(`\n\n\n\n\n`);
    console.log(lines);
    debugger;
}
//if (rules.length > 5) {
    console.log(`\n\n\n\n\n${fn.toString()}`);
//}
//debugger;
    return fn;
}





// TODO: doc...
function getBodyLines(rules: Rule[], handlerIds: Map<Rule, string>): string[] {

    // TODO: ... rename all these...
    let rules2 = rules.slice();
    let body2 = [`var req = request, res, captures, state = 1;`, '']; // TODO: think about deopt due to 'captures' being re-used with different props...
    let lines2: string[] = [];
    let downstreamRule: Rule;

    // TODO: Iterate over rules, from most to least specific
    while (rules2.length > 0) {

        // If the next rule is a decorator, wrap all previously generated lines (if any) into a local 'downstream' function.
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

        // How long a run of non-decorator rules are we looking at from here down?
        let runCount = rules2.slice(1).findIndex(rule => rule.isDecorator) + 1;
        if (runCount === 0) runCount = rules2.length;

        // Slice out the next run of non-decorator rules...
        let run = rules2.slice(0, runCount);
        rules2 = rules2.slice(runCount);
        let runName = handlerIds.get(run[0]);


        // TODO: not working yet...
        // // TODO: any handlers in run have a $req param?
        // let runRefsReq = run.some(rule => rule.parameterNames.indexOf('$req') !== -1);
        // if (runRefsReq) lines2.push(`    var req = req === void 0 ? request : req`);

        // Enumerate over all the rules in the non-decorator run, from most to least specific.
        for (let i = 1; i <= run.length; ++i) {

            // TODO: ...
            let rule = run[i - 1];
            let paramNames = rule.parameterNames;
            let captureNames = rule.pattern.captureNames;
            let paramMappings = captureNames.reduce((map, name) => (map[name] = `captures.${name}`, map), {});
            let builtinMappings = {
                $addr: 'address',
                $req: 'req === void 0 ? request : req',
                $next: `${downstreamRule ? `(state = 1, downstream_of${handlerIds.get(downstreamRule)})` : 'no_downstream'}`
            };

            // TODO: ...
            if (run.length > 1) lines2.push(`case ${i}:`);

            // TODO: ...
            if (i > 1) lines2.push(`    if (res !== null) return res;`);

            // TODO: ...
            if (captureNames.length > 0) lines2.push(`captures = match${handlerIds.get(rule)}(address);`);
            lines2.push(`    res = handle${handlerIds.get(rule)}(${paramNames.map(name => paramMappings[name] || builtinMappings[name]).join(', ')});`);

            // TODO: ...
            if (i < run.length) {
                lines2.push(`    if (isPromise(res)) return res.then(val => (res = val, state = ${i + 1}, ${runName}(req)));`); // TODO: <----- NAME of self
                lines2.push(`    /* fall-through */`);
                lines2.push(`    `);
            }
            else {
                lines2.push('    return res;');
            }
        }

        // Run prolog and epilog...
        if (run.length > 1) {
            lines2 = [
                `function ${runName}(req) {`,
                `    switch (state) {`,
                ...lines2.map(line => `        ${line}`),
                `    }`,
                `}`,
                `return ${runName}();`
            ];
        }
        else {
            // dedent one level
            lines2 = lines2.map(line => line.slice(4));
        }

        // TODO: explain...
        downstreamRule = rules2[0];
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
