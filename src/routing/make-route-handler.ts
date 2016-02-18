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
            return request => {
                let response = downstream(request);
                if (response !== null) return response;
                return handler(request);
            };
        }
        else {
            return request => handler(request, downstream);
        }
    }, nullHandler);

    let source = `function ${name}(request) { return execute(request); }`;
    let result: Handler = eval(`(${source})`);
    return result;
}





// TODO: ...
const nullHandler: Handler = request => null;
