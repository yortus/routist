'use strict';
var assert = require('assert');
// TODO: review all docs below after data structure changes
// TODO: doc...
var Taxonomy = (function () {
    // TODO: doc...
    function Taxonomy(pattern) {
        this.pattern = pattern;
        // TODO: doc...
        this.parents = [];
        // TODO: doc...
        this.children = [];
    }
    // TODO: doc...
    Taxonomy.prototype.hasChild = function (childNode) {
        return this.children.indexOf(childNode) !== -1;
    };
    // TODO: doc...
    Taxonomy.prototype.addChild = function (childNode) {
        // NB: If the child is already there, make this a no-op.
        if (this.hasChild(childNode))
            return;
        this.children.push(childNode);
        childNode.parents.push(this);
    };
    // TODO: doc...
    Taxonomy.prototype.removeChild = function (childNode) {
        assert(this.hasChild(childNode));
        this.children.splice(this.children.indexOf(childNode), 1);
        childNode.parents.splice(childNode.parents.indexOf(this), 1);
    };
    return Taxonomy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Taxonomy;
//# sourceMappingURL=taxonomy.js.map