'use strict';
var pattern_1 = require('../patterns/pattern');
// TODO: doc...
class Rule {
    // TODO: doc...
    constructor(signature) {
        this.signature = signature;
        // TODO: doc...
        this.lessSpecific = [];
        // TODO: doc...
        this.moreSpecific = [];
        let quickPattern = new pattern_1.default(signature);
        this.isMatch = (pathname) => quickPattern.match(pathname) !== null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Rule;
//# sourceMappingURL=rule.js.map