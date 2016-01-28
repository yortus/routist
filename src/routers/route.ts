'use strict';
import Request from '../request';
import Response from '../response';
import RuleNode from './rule-node';





// TODO: ...
export default class Route {


    //TODO:...
    constructor(rule: RuleNode) {
    }


    //TODO:...
    isMatch: (pathname: string) => boolean;


    //TODO:...
    moreSpecific: Route[];


    //TODO:...
    execute: (request: Request) => Response;


}
