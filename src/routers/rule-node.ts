'use strict';
import Handler from '../handlers/handler';
import Pattern from '../patterns/pattern';





// TODO: doc...
export default class RuleNode {


    // TODO: doc...
    constructor(public signature: string) {
        let quickMatchPattern = new Pattern(signature);
        this.isMatch = (pathname: string) => quickMatchPattern.match(pathname) !== null;
    }


    // TODO: doc...
    pattern: Pattern;


    // TODO: doc...
    handler: Handler;


    // TODO: doc...
    lessSpecific: RuleNode[] = [];


    // TODO: doc...
    moreSpecific: RuleNode[] = [];


    // TODO: doc...
    isMatch: (pathname: string) => boolean;
}
