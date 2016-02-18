'use strict';
var assert = require('assert');
// TODO: review all docs below after data structure changes
// TODO: doc...
var Taxonomy = (function () {
    // TODO: doc...
    function Taxonomy(pattern) {
        this.pattern = pattern;
        // TODO: doc...
        this.generalizations = [];
        // TODO: doc...
        this.specializations = [];
    }
    Object.defineProperty(Taxonomy.prototype, "allPatterns", {
        // TODO: doc...
        get: function () {
            var allWithDups = (_a = [this.pattern]).concat.apply(_a, this.specializations.map(function (spec) { return spec.allPatterns; }));
            var resultSet = allWithDups.reduce(function (set, pat) { return set.add(pat); }, new Set());
            return Array.from(resultSet.values());
            var _a;
        },
        enumerable: true,
        configurable: true
    });
    // TODO: doc...
    Taxonomy.prototype.hasSpecialization = function (spcialization) {
        return this.specializations.indexOf(spcialization) !== -1;
    };
    // TODO: doc...
    // TODO: should be 'internal' to makeTaxonomy...
    Taxonomy.prototype.addSpecialization = function (specialization) {
        // NB: If the child is already there, make this a no-op.
        if (this.hasSpecialization(specialization))
            return;
        this.specializations.push(specialization);
        specialization.generalizations.push(this);
    };
    // TODO: doc...
    // TODO: should be 'internal' to makeTaxonomy...
    Taxonomy.prototype.removeSpecialization = function (specialization) {
        assert(this.hasSpecialization(specialization));
        this.specializations.splice(this.specializations.indexOf(specialization), 1);
        specialization.generalizations.splice(specialization.generalizations.indexOf(this), 1);
    };
    return Taxonomy;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Taxonomy;
//# sourceMappingURL=taxonomy.js.map