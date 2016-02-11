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
        this.execute = reverseHandlers.reduce<(rq: Request) => Response>((downstream, handler) => { // TODO: fix cast!
            let result: (request: Request) => Response;
            if (isDecorator(handler)) {
                result = request => handler(request, <any>downstream); // TODO: fix cast!!
            }
            else {
                result = request => {
                    let response = (<any>downstream)(request); // TODO: fix cast!!!
                    if (response !== null) return response;
                    return (<any>handler)(request); // TODO: fix casts!!!
                };
            }
            return result;
        }, noMore);
    }


    // TODO: ...
    name: string;


    // TODO: ...
    execute: (rq: Request) => Response;
}





// TODO: ...
const noMore = (rq: Request) => <Response> null;
