'use strict';
import Handler from './handler';
import isDecorator from './is-decorator';
import Request from '../request';
import Response from '../response';





// TODO: ...
export default class Route {


    // TODO: ...
    constructor(name: string, public handlers: Handler[]) {

        // TODO: ...
        this.name = name;

        // TODO: ...
        let reverseHandlers = handlers.slice().reverse();
        this.execute = reverseHandlers.reduce((downstream, handler) => {
            if (isDecorator(handler)) {
                return request => handler(request, downstream);
            }
            else {
                return request => {
                    let response = downstream(request);
                    if (response !== null) return response;
                    return handler(request);
                };
            }
        }, noMore);
    }


    // TODO: ...
    name: string;


    // TODO: ...
    execute: (rq: Request) => Response;
}





// TODO: ...
const noMore = (rq: Request) => <Response> null;
