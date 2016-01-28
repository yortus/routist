'use strict';
var pattern_1 = require('../patterns/pattern');
// TODO: doc...
class RuleNode {
    // TODO: doc...
    constructor(signature) {
        this.signature = signature;
        // TODO: doc...
        this.lessSpecific = [];
        // TODO: doc...
        this.moreSpecific = [];
        let quickMatchPattern = new pattern_1.default(signature);
        this.isMatch = (pathname) => quickMatchPattern.match(pathname) !== null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RuleNode;
//# sourceMappingURL=rule-node.js.map