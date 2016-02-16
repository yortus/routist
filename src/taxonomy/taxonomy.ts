'use strict';
import * as assert from 'assert';
import Pattern from '../pattern';
// TODO: review all docs below after data structure changes





// TODO: doc...
export default class Taxonomy {


    // TODO: doc...
    constructor(public pattern: Pattern) { }


    // TODO: doc...
    generalizations: Taxonomy[] = [];


    // TODO: doc...
    specializations: Taxonomy[] = [];


    // TODO: doc...
    hasSpecialization(spcialization: Taxonomy): boolean {
        return this.specializations.indexOf(spcialization) !== -1;
    }


    // TODO: doc...
    // TODO: should be 'internal' to makeTaxonomy...
    addSpecialization(specialization: Taxonomy) {
        // NB: If the child is already there, make this a no-op.
        if (this.hasSpecialization(specialization)) return;
        this.specializations.push(specialization);
        specialization.generalizations.push(this);
    }


    // TODO: doc...
    // TODO: should be 'internal' to makeTaxonomy...
    removeSpecialization(specialization: Taxonomy) {
        assert(this.hasSpecialization(specialization));
        this.specializations.splice(this.specializations.indexOf(specialization), 1);
        specialization.generalizations.splice(specialization.generalizations.indexOf(this), 1);
    }
}
