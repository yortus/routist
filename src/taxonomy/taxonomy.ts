'use strict';
import * as assert from 'assert';
import Pattern from '../pattern';
// TODO: review all docs below after data structure changes





// TODO: doc...
export default class Taxonomy {


    // TODO: doc...
    constructor(public pattern: Pattern) { }


    // TODO: doc...
    parents: Taxonomy[] = [];


    // TODO: doc...
    children: Taxonomy[] = [];


    // TODO: doc...
    hasChild(childNode: Taxonomy): boolean {
        return this.children.indexOf(childNode) !== -1;
    }


    // TODO: doc...
    addChild(childNode: Taxonomy) {
        // NB: If the child is already there, make this a no-op.
        if (this.hasChild(childNode)) return;
        this.children.push(childNode);
        childNode.parents.push(this);
    }


    // TODO: doc...
    removeChild(childNode: Taxonomy) {
        assert(this.hasChild(childNode));
        this.children.splice(this.children.indexOf(childNode), 1);
        childNode.parents.splice(childNode.parents.indexOf(this), 1);
    }
}
