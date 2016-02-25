'use strict';
import compileRuleSet from './compile-rule-set';





// TODO: doc...
// TODO: add strong typing and generic types
export default class RuleSet {


    // TODO: doc...
    constructor(rules) {
        this.execute = compileRuleSet(rules);
    }


    // TODO: doc...
    execute: (address, request) => any;
}
