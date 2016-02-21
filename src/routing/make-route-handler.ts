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


//TODO: BUG exposed on next line:
//      - different rules whose pattern source is the same (but maybe they have a different commment) will try to overwrite
//        the same identifier. They need to all get a unique indentifier! But still keep them human readable (eg append '_1', '_2' etc)
//      - This BUG is probably also in makeDispatcher... Invesigate... ANS: no, only distinct patterns are used in the dispatcher...

    // TODO: move out to helper function...
    let reservedIds = new Set<string>();
    let handlerIds = rules.reduce(
        (map, rule) => {
            // TODO: ...
            let base = makePatternIdentifier(rule.pattern);
            for (let isReserved = true, index = 0; isReserved; ++index) {
                var id = `_${base}${index ? `_${index}` : ''}`;
                isReserved = reservedIds.has(id);
            }
            reservedIds.add(id);
            return map.set(rule, id);
        },
        new Map<Rule, string>()
    );


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





//TODO:
// all handlers: pass in 'address' sneakily as 'this' via Function#call (still very fast!)


// TODO: temp testing...
`
function makeHandler(rules: Rule[]) {
    say rules = {
        0: <Root>Partial,
        1: Partial,
        2: Decorator,
        3: Partial,
        4: Partial,
        5: <Leaf>Partial
    }


    let handle3_4_5 = function (address, request) {
        var response;
        if ((response = handler5(address, request)) !== null) return response;
        if ((response = handler4(address, request)) !== null) return response;
        if ((response = handler3(address, request)) !== null) return response;
        return null;
    }

    let handle2 = function (address, request) {

        let downstream = function (req) {
            req = arguments.length > 0 ? req : request;
            return handle3_4_5(address, req);
        };

        var response;
        response = handler2(address, request, handle3_4_5);
        return response;
    }

    let handle0_1_2 = function (address, request) {
        var response;
        if ((response = handler2(address, request)) !== null) return response;
        if ((response = handler1(address, request)) !== null) return response;
        if ((response = handler0(address, request)) !== null) return response;
        return null;
    }

    let finalHandler = (address, request) {
        return handle0_1_2(address, request);
    }

    

    



}








`