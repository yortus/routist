'use strict';
/** Represents a single node in a Taxonomy graph. */
var TaxonomyNode = (function () {
    /** Constructs a new TaxonomyNode instance that holds the given pattern. */
    function TaxonomyNode(pattern) {
        /** Links to this node's direct parents (i.e., incoming edges). */
        this.generalizations = [];
        /** Links to this node's direct children (i.e., outgoing edges). */
        this.specializations = [];
        this.pattern = pattern;
    }
    return TaxonomyNode;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaxonomyNode;
//# sourceMappingURL=taxonomy-node.js.map