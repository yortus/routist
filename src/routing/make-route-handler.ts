'use strict';
import * as assert from 'assert';
import {Handler, PartialHandler, GeneralHandler, Route} from './types';
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
// TODO: temp testing...
route.forEach(rule => {
    console.log(`${rule.pattern.toString()} [${isPartialHandler(rule.handler) ? 'PARTIAL' : 'GENERAL'}]`);
});
//debugger;


//TODO: BUG exposed on next line:
//      - different rules whose pattern source is the same (but maybe they have a different commment) will try to overwrite
//        the same identifier. They need to all get a unique indentifier! But still keep them human readable (eg append '_1', '_2' etc)
//      - This BUG is probably also in makeDispatcher... Invesigate...

    let prolog = route.map(({pattern, handler}, i) => `const _${makePatternIdentifier(pattern)} = route[${i}].handler;\n`).join('');

    let bodyLines = ['var response;'];

    // Iterate over rules, from most to least specific
    for (let i = route.length - 1; i >= 0; --i) {
        let {pattern, handler} = route[i];

        if (isPartialHandler(handler)) {
            // TODO: ...
            let line = `if ((response = _${makePatternIdentifier(pattern)}(address, request)) !== null) return response;`;
            bodyLines.push(line);
        }
        else /* general handler */ {
            // TODO: ...

            bodyLines.forEach((line, i) => bodyLines[i] = `    ${line}`);
            bodyLines.unshift(`function downstream(request) {debugger;`); // TODO: remove debugger...
            bodyLines.push(`    return null;`);
            bodyLines.push(`}`);
            bodyLines.push(``);
            bodyLines.push(`var response;`);
            bodyLines.push(`if ((response = _${makePatternIdentifier(pattern)}(address, request, downstream)) !== null) return response;`);
        }
    }

    bodyLines.push(`return null;`);


    // TODO: remove try/catch from source after testing...
    let indent = `    `;
    let body = bodyLines.map(line => `${indent}${line}\n`).join('');
    let source = `${prolog}\nreturn function _route(address, request) {try{\n${body}}catch(ex){\ndebugger;      \n } }`;


    let fn = (function(route) {
        let fn = eval(`(() => {\n${source}\n})`)();
        return fn;
    })(route);


console.log(fn.toString());
debugger;
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