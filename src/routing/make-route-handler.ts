'use strict';
import * as assert from 'assert';
import {Handler, PartialHandler, GeneralHandler, Route, Rule} from './types';
import isPartialHandler from './is-partial-handler';
import makePatternIdentifier from './make-pattern-identifier';





// TODO: ...
export default function makeRouteHandler(route: Route): Handler {

// TODO: temp testing...
if (route.length > 4) {
    return makeRouteHandler2(route);
}    


    let reverseRoute = route.slice().reverse();


    let name = '__' + makePatternIdentifier(reverseRoute[0].pattern) + '__';


    // TODO: ...
    let execute = reverseRoute.reduce<Handler>((downstream, rule) => {
        let handler: PartialHandler|GeneralHandler = rule.handler;
        if (isPartialHandler(handler)) {
            return (address, request) => {
                let response = downstream(address, request);
                if (response !== null) return response;
                return handler(address, request);
            };
        }
        else {
            return (address, request) => handler(address, request, downstream);
        }
    }, nullHandler);

    // TODO: needless wrapping of func-in-func?
    let source = `function ${name}(address, request) { return execute(address, request); }`;
    let result: Handler = eval(`(${source})`);
    return result;
}





// TODO: ...
const nullHandler: Handler = (address, request) => null;





function makeRouteHandler2(route: Route): Handler {

    // TODO: specific to general...
    let rules = route.slice().reverse();

// TODO: temp testing...
// rules.forEach(rule => {
//     console.log(`${rule.pattern.toString()} [${isPartialHandler(rule.handler) ? 'PARTIAL' : 'GENERAL'}]`);
// });
// debugger;


    // TODO: doc...
    let handlerIds = makeHandlerIdentifiers(rules);




    let prolog = rules.map((rule, i) => `const ${handlerIds.get(rule)} = rules[${i}].handler;\n`).join('');

    let bodyLines = ['var response;'];

    // Iterate over rules, from most to least specific
    rules.forEach(rule => {

        if (isPartialHandler(rule.handler)) {
            // TODO: ...
            let line = `if ((response = ${handlerIds.get(rule)}(address, request)) !== null) return response;`;
            bodyLines.push(line);
        }
        else /* general handler */ {
            // TODO: ...

            bodyLines.forEach((line, i) => bodyLines[i] = `    ${line}`);
            bodyLines.unshift(`function downstream(request) {`); // TODO: remove debugger...
            bodyLines.push(`    return null;`);
            bodyLines.push(`}`);
            bodyLines.push(``);
            bodyLines.push(`var response;`);
            bodyLines.push(`if ((response = ${handlerIds.get(rule)}(address, request, downstream)) !== null) return response;`);
        }
    });

    bodyLines.push(`return null;`);


    let indent = `    `;
    let body = bodyLines.map(line => `${indent}${line}\n`).join('');
    let source = `${prolog}\nreturn function _route(address, request) {\n${body}}`;


    let fn = (function(rules) {
        let fn = eval(`(() => {\n${source}\n})`)();
        return fn;
    })(rules);


//console.log(fn.toString());
//debugger;
    return fn;
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
