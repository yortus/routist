'use strict';
import {Handler, PartialHandler, GeneralHandler, Route} from './types';
import isPartialHandler from './is-partial-handler';
import makePatternIdentifier from './make-pattern-identifier';





// TODO: ...
export default function makeRouteHandler(route: Route): Handler {

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

        // NB: closes over address... therefore need new function/closure for EVERY request!!! how to avoid??? Function#bind?
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