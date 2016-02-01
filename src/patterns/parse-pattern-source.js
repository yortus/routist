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
    =   !"∅"   elems:Element*   TRAILING_WS?
        {
            var signature = elems.map(elem => elem[0]).join('');
            var captureNames = elems.map(elem => elem[1]).filter(name => !!name);
            return { signature, captureNames };
        }
    /   "∅"   { return { signature: "∅", captureNames: [] }; }

    Element
    =   Globstar
    /   Wildcard
    /   Literal

    Globstar 'globstar'
    =   ("**" / "…")   !("*" / "…" / "{")   { return ['…', '?']; }
    /   "{..."   id:IDENTIFIER   "}"   !("*" / "…" / "{")   { return ['…', id]; }

    Wildcard 'wildcard'
    =   "*"   !("*" / "…" / "{")   { return ['*', '?']; }
    /   "{"   id:IDENTIFIER   "}"   !("*" / "…" / "{")   { return ['*', id]; }

    Literal 'literal'
    =   c:[a-zA-Z0-9/._-]   { return [c, null]; }

    IDENTIFIER
    =   [a-z_$]i   [a-z0-9_$]i*   { return text(); }

    TRAILING_WS
    =   " "*   ("#"   .*)?
    // ================================================================================
`);
//# sourceMappingURL=parse-pattern-source.js.map