'use strict';
var parser = require('./route-pattern-dsl');
/**
 * Verifies that `pattern` has a valid format, and returns metadata about the pattern.
 * Throws an error if `pattern` is invalid.
 */
function parsePattern(pattern) {
    try {
        let ast = parser.parse(pattern);
        return ast;
    }
    catch (ex) {
        let startCol = ex.location.start.column;
        let endCol = ex.location.end.column;
        if (endCol <= startCol)
            endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        let msg = `${ex.message}:\n${pattern}\n${indicator}`;
        throw new Error(msg);
    }
}
exports.default = parsePattern;
//# sourceMappingURL=parse-pattern.js.map