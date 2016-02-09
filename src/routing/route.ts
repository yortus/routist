'use strict';
import Handler from './handler';
import isDecorator from './is-decorator';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';





// TODO: ...
export default class Route {


    // TODO: ...
    constructor(public rules: {pattern: Pattern; handler: Handler}[]) {
        let reverseRules = rules.slice().reverse();
        this.name = reverseRules[0].pattern.toString();
        this.execute = reverseRules.reduce((downstream, rule) => {
            let handler = rule.handler;
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
