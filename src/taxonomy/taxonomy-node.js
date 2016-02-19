'use strict';
// TODO: review all docs below after data structure changes
// TODO: doc...
var TaxonomyNode = (function () {
    /**
     * Constructs a new TaxonomyNode instance.
     */
    function TaxonomyNode(pattern) {
        // TODO: doc...
        this.generalizations = [];
        // TODO: doc...
        this.specializations = [];
        this.pattern = pattern;
    }
    return TaxonomyNode;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaxonomyNode;
//# sourceMappingURL=taxonomy-node.js.map