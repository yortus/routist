'use strict';
import isDecorator from './is-decorator';
import Request from '../request';
import Response from '../response';
import Rule from './rule';





// TODO: ...
export default class Route {


    // TODO: ...
    constructor(public rules: Rule[]) {
        let reverseRules = rules.slice().reverse();
        this.name = reverseRules[0].pattern.toString();
        this.execute = reverseRules.reduce((downstream, rule) => {
            let handler = rule.execute;
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
