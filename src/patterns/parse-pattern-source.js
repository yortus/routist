'use strict';
var PEG = require('pegjs');
/**
 * Verifies that `pattern` has a valid format, and returns metadata about the pattern.
 * Throws an error if `pattern` is invalid. A valid pattern conforms to the following rules:
 * - Patterns are case-sensitive.
 * - A pattern consists of an alternating sequence of captures and literals.
 * - A literal consists of one or more adjacent characters from [A-Za-z0-9/._-].
 * - Literals must exactly match a corresponding portion of an address.
 * - A capture represents an operator that matches zero or more characters of an address.
 * - There are two types of captures: globstars and wildcards.
 * - A globstar matches zero or more adjacent characters in an address.
 * - A wildcard matches zero or more adjacent characters in an address, but cannot match '/'.
 * - Captures may be named or anonymous. Named captures return their correspoding capture
 *     values in the result of a call to Pattern#match.
 * - An anonymous globstar is designated with '**' or '…'.
 * - A named globstar is designated with '{...id}' where id is a valid JS identifier.
 * - An anonymous wildcard is designated with '*'.
 * - A named wildcard is designated with '{id}' where id is a valid JS identifier.
 * - Two captures may not occupy adjacent positions in a pattern.
 * - Patterns may have trailing whitespace, which is removed.
 * - Whitespace consists of spaces and/or comments.
 * - A comment begins with '#' and continues to the end of the string.
 * Examples:
 * - '/foo/*' matches '/foo/bar' but not '/foo/bar/baz'
 * - '/foo**' (or '/foo…') matches '/foo', '/foo/bar' and '/foo/bar/baz'
 * - '{...path}/{name}.{ext} matches '/api/foo/bar.html' with {path: '/api/foo', name: 'bar', ext: 'baz' }
 * @param {string} pattern - the pattern source string to be parsed.
 * @returns {{signature: string; captureNames: string[]}} an object containing metadata
 *        about the pattern, with the following members:
 *        - 'signature': the pattern in its normalized form (i.e. all named captures
 *          replaced with '*' and '…').
 *        - 'captureNames': an array of strings, with one element per capture in the
 *          pattern. Each element holds the name of its corresponding capture, or '?'
 *          if the corresponding capture is anonymous (i.e. '*' or '…').
 */
function parsePatternSource(pattern) {
    try {
        var ast = parser.parse(pattern);
        return ast;
    }
    catch (ex) {
        var startCol = ex.location.start.column;
        var endCol = ex.location.end.column;
        if (endCol <= startCol)
            endCol = startCol + 1;
        var indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        var msg = ex.message + ":\n" + pattern + "\n" + indicator;
        throw new Error(msg);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parsePatternSource;
// Use a PEG grammar to parse pattern strings.
var parser;
parser = PEG.buildParser("\n    // ================================================================================\n    Pattern\n    =   !\"\u2205\"   elems:Element*   TRAILING_WS?\n        {\n            var signature = elems.map(elem => elem[0]).join('');\n            var captureNames = elems.map(elem => elem[1]).filter(name => !!name);\n            return { signature, captureNames };\n        }\n    /   \"\u2205\"   { return { signature: \"\u2205\", captureNames: [] }; }\n\n    Element\n    =   Globstar\n    /   Wildcard\n    /   Literal\n\n    Globstar 'globstar'\n    =   (\"**\" / \"\u2026\")   !(\"*\" / \"\u2026\" / \"{\")   { return ['\u2026', '?']; }\n    /   \"{...\"   id:IDENTIFIER   \"}\"   !(\"*\" / \"\u2026\" / \"{\")   { return ['\u2026', id]; }\n\n    Wildcard 'wildcard'\n    =   \"*\"   !(\"*\" / \"\u2026\" / \"{\")   { return ['*', '?']; }\n    /   \"{\"   id:IDENTIFIER   \"}\"   !(\"*\" / \"\u2026\" / \"{\")   { return ['*', id]; }\n\n    Literal 'literal'\n    =   c:[a-zA-Z0-9/._-]   { return [c, null]; }\n\n    IDENTIFIER\n    =   [a-z_$]i   [a-z0-9_$]i*   { return text(); }\n\n    TRAILING_WS\n    =   \" \"*   (\"#\"   .*)?\n    // ================================================================================\n");
//# sourceMappingURL=parse-pattern-source.js.map