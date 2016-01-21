'use strict';
var PEG = require('pegjs');
// TODO: describe 'valid' pattern strings:
// - can't have adjacent captures
// - literal text can only include chars: A-Z a-z 0-9 _ - . /
// - capture names must be valid JS identifiers (actually just A-Z a-z 0-9 $ _)
// - ** and … are synonymous
/**
 * Verifies that `pattern` has a valid format, and returns metadata about the pattern.
 * Throws an error if `pattern` is invalid. The returned metadata is as follows:
 * - signature: the pattern in its normalized form.
 * - captureNames: an array of strings, with one element per wildcard/capture in the pattern.
 *                 Each element holds the name of its corresponding capture, or '?'
 *                 if the corresponding capture is anonymous (ie an '*' or '…' wildcard).
 */
function parsePatternSource(pattern) {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parsePatternSource;
// Use a PEG grammar to parse pattern strings.
var parser;
parser = PEG.buildParser(`
    // ================================================================================
    Pattern
    =   !"∅"   elems:Element*
        {
            var signature = elems.map(elem => elem[0]).join('');
            var captureNames = elems.map(elem => elem[1]).filter(name => !!name);
            return { signature, captureNames };
        }
    /   "∅"   { return { signature: "∅", captureNames: [] }; }

    Element
    =   Globstar
    /   Wildcard
    /   PathSeparator
    /   Literal

    Globstar 'globstar'
    =   ("**" / "…")   !("*" / "…" / "{")   { return ['…', '?']; }
    /   "{..."   id:IDENTIFIER   "}"   !("*" / "…" / "{")   { return ['…', id]; }

    Wildcard 'wildcard'
    =   "*"   !("*" / "…" / "{")   { return ['*', '?']; }
    /   "{"   id:IDENTIFIER   "}"   !("*" / "…" / "{")   { return ['*', id]; }

    PathSeparator 'path separator'
    =   "/"   !"/"   { return ['/', null]; }

    Literal 'literal'
    =   c:[a-zA-Z0-9._-]   { return [c, null]; }

    IDENTIFIER
    =   [a-z_$]i   [a-z0-9_$]i*   { return text(); }
    // ================================================================================
`);
//# sourceMappingURL=parse-pattern-source.js.map