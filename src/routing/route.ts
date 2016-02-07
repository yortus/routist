'use strict';
import Request from '../request';
import Response from '../response';
import Rule from './rule';





// TODO: ...
export default class Route {


    // TODO: ...
    constructor(public rules: Rule[]) {
        let reverseRules = rules.slice().reverse();
        this.name = reverseRules[0].pattern.toString();
        this.execute = reverseRules.reduce((downstream, rule) => request => rule.execute(request, downstream), noMore);
    }


    // TODO: ...
    name: string;


    // TODO: ...
    execute: (rq: Request) => Response;
}





// TODO: ...
const noMore = (rq: Request) => <Response> null;
