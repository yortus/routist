'use strict';
import Pattern from '../pattern';
// TODO: review all docs below after data structure changes





// TODO: doc...
export default class TaxonomyNode {


    /**
     * Constructs a new TaxonomyNode instance.
     */
    constructor(pattern: Pattern) {
        this.pattern = pattern;
    }


    // TODO: doc...
    pattern: Pattern;


    // TODO: doc...
    generalizations: TaxonomyNode[] = [];


    // TODO: doc...
    specializations: TaxonomyNode[] = [];
}
