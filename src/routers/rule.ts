'use strict';
import Handler from '../handlers/handler';
import Pattern from '../patterns/pattern';





// TODO: doc...
export default class Rule {


    // TODO: doc...
    constructor(public signature: string) {
        let quickPattern = new Pattern(signature);
        this.isMatch = (pathname: string) => quickPattern.match(pathname) !== null;
    }


    // TODO: doc...
    pattern: Pattern;


    // TODO: doc...
    handler: Handler;


    // TODO: doc...
    lessSpecific: Rule[] = [];


    // TODO: doc...
    moreSpecific: Rule[] = [];


    // TODO: doc...
    isMatch: (pathname: string) => boolean;
}
