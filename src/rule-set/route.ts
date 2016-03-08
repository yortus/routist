'use strict';
import Rule from './rule';





// TODO: doc...
// TODO: a list of rules ordered from most- to least-specific, where for all N, rule N's pattern is a subset of rule N+1's pattern
export default class Route extends Array<Rule> {


    // TODO: doc...
    constructor(...rules: Rule[]) {
        super();

        // TODO: address hackiness here... This doesn't return a subclass of Array, it just returns an array. Is that OK (this is an internal 'class' after all)
        return rules.slice().reverse();
    }
}
