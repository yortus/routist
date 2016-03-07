'use strict';
import Rule from './rule';





// TODO: doc...
export default class Route extends Array<Rule> {


    // TODO: doc...
    constructor(...rules: Rule[]) {
        super(...rules);
    }
}
