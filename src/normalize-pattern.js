'use strict';
var parse_pattern_1 = require('./parse-pattern');
/**
 * Returns the canonical representation of the given pattern.
 * Patterns that match the same set of pathnames are guaranteed
 * to have the same canonical representation.
 */
function normalizePattern(pattern) {
    let ast = parse_pattern_1.default(pattern);
    return ast.canonical;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = normalizePattern;
//# sourceMappingURL=normalize-pattern.js.map