'use strict';
var PEG = require('pegjs');
/**
 * Verifies that `patternSource` has a valid format, and returns abstract syntax information
 * about the pattern. Throws an error if `patternSource` is invalid. Consult the documentation
 * for further information about the pattern DSL.
 * @param {string} patternSource - the pattern source string to be parsed.
 * @returns {PatternAST} an object containing details about the successfully parsed pattern.
 */
function parsePatternSource(patternSource) {
    try {
        var ast = parser.parse(patternSource);
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
// Use a PEG grammar to parse pattern strings.
var parser;
parser = PEG.buildParser("\n    // ================================================================================\n    Pattern\n    =   !\"\u2205\"   elems:Element*   TRAILING_WS?\n        {\n            var signature = elems.map(elem => elem[0]).join('');\n            var captures = elems.map(elem => elem[1]).filter(name => !!name);\n            return { signature, captures };\n        }\n    /   \"\u2205\"   { return { signature: \"\u2205\", captures: [] }; }\n\n    Element\n    =   Globstar\n    /   Wildcard\n    /   Literal\n\n    Globstar 'globstar'\n    =   (\"**\" / \"\u2026\")   !(\"*\" / \"\u2026\" / \"{\")   { return ['\u2026', '?']; }\n    /   \"{...\"   id:IDENTIFIER   \"}\"   !(\"*\" / \"\u2026\" / \"{\")   { return ['\u2026', id]; }\n\n    Wildcard 'wildcard'\n    =   \"*\"   !(\"*\" / \"\u2026\" / \"{\")   { return ['*', '?']; }\n    /   \"{\"   id:IDENTIFIER   \"}\"   !(\"*\" / \"\u2026\" / \"{\")   { return ['*', id]; }\n\n    Literal 'literal'\n    =   c:[a-zA-Z0-9/._-]   { return [c, null]; }\n\n    IDENTIFIER\n    =   [a-z_$]i   [a-z0-9_$]i*   { return text(); }\n\n    TRAILING_WS\n    =   \" \"*   (\"#\"   .*)?\n    // ================================================================================\n");
//# sourceMappingURL=parse-pattern-source.js.map