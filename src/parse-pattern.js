'use strict';
var PEG = require('pegjs');
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
// Use a PEG grammar to parse pattern strings.
var parser;
parser = PEG.buildParser(`
    // ================================================================================
    Pattern
    =   !"∅"   elems:Element*
        {
            var canonical = elems.map(elem => elem[0]).join('');
            var captureNames = elems.map(elem => elem[1]).filter(name => !!name);
            return { canonical, captureNames };
        }
    /   "∅"   { return { canonical: "∅", captureNames: [] }; }

    Element
    =   Globstar
    /   Wildcard
    /   PathSeparator
    /   Literal

    Globstar 'globstar'
    =   ("**" / "…")   !"*"   !"…"   { return ['…', '?']; }
    /   "{..."   id:IDENTIFIER   "}"   { return ['…', id]; }

    Wildcard 'wildcard'
    =   "*"   !"*"   !"…"   { return ['*', '?']; }
    /   "{"   id:IDENTIFIER   "}"   { return ['*', id]; }

    PathSeparator 'path separator'
    =   "/"   !"/"   { return ['/', null]; }

    Literal 'literal'
    =   c:[a-zA-Z0-9._-]   { return [c, null]; }

    IDENTIFIER
    =   [a-z_$]i   [a-z0-9_$]i*   { return text(); }
    // ================================================================================
`);
//# sourceMappingURL=parse-pattern.js.map