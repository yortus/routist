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
