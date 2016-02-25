'use strict';
var patternSourceGrammar = require('./pattern-source-grammar');
/**
 * Verifies that `patternSource` has a valid format, and returns abstract syntax information
 * about the pattern. Throws an error if `patternSource` is invalid. Consult the documentation
 * for further information about the pattern DSL.
 * @param {string} patternSource - the pattern source string to be parsed.
 * @returns {PatternAST} an object containing details about the successfully parsed pattern.
 */
function parsePatternSource(patternSource) {
    try {
        var ast = patternSourceGrammar.parse(patternSource);
        return ast;
    }
    catch (ex) {
        var startCol = ex.location.start.column;
        var endCol = ex.location.end.column;
        if (endCol <= startCol)
            endCol = startCol + 1;
        var indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        var msg = ex.message + ":\n" + patternSource + "\n" + indicator;
        throw new Error(msg);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parsePatternSource;
//# sourceMappingURL=parse-pattern-source.js.map