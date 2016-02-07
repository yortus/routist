'use strict';
import * as PEG from 'pegjs';
// TODO: review jsdocs after pattern overhaul
// TODO: move detailed jsdocs below into README





/** Holds the information associated with a successfully parsed pattern source string. */
export interface PatternAST {


    // TODO: doc... ref back to original source (makeMatchFunction uses this)
    source: string;


    /**
     * The pattern in its normalized form (i.e. all named captures replaced with '*' and '…').
     * Any two patterns with the same signature are guaranteed to match the same set of addresses.
     */
    signature: string;


    /**
     * A string array whose elements correspond, in order, to the captures in the pattern.
     * Each element holds the name of its corresponding capture, or '?' if the corresponding
     * capture is anonymous (i.e. '*' or '…'). For example, the pattern '{...path}/*.{ext}'
     * has a `captureNames` value of ['path', '?', 'ext'].
     */
    captureNames: string[];
}





/**
 * Verifies that `patternSource` has a valid format, and returns metadata about the pattern.
 * Throws an error if `patternSource` is invalid. A valid pattern conforms to the following rules:
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
 *
 * Examples:
 * - '/foo/*' matches '/foo/bar' but not '/foo/bar/baz'
 * - '/foo**' (or '/foo…') matches '/foo', '/foo/bar' and '/foo/bar/baz'
 * - '{...path}/{name}.{ext} matches '/api/foo/bar.html' with {path: '/api/foo', name: 'bar', ext: 'baz' }
 *
 * @param {string} pattern - the pattern source string to be parsed.
 * @returns {PatternAST} an object containing details about the successfully parsed pattern.
 */
export default function parsePatternSource(patternSource: string) {
    try {
        let ast = parser.parse(patternSource);
        return ast;
    }
    catch (ex) {
        let startCol = ex.location.start.column;
        let endCol = ex.location.end.column;
        if (endCol <= startCol) endCol = startCol + 1;
        let indicator = Array(startCol).join(' ') + Array(endCol - startCol + 1).join('^');
        let msg = `${ex.message}:\n${patternSource}\n${indicator}`;
        throw new Error(msg);
    }
}





// Use a PEG grammar to parse pattern strings.
var parser: { parse(input: string): PatternAST; };
parser = PEG.buildParser(`
    // ================================================================================
    Pattern
    =   !"∅"   elems:Element*   TRAILING_WS?
        {
            var signature = elems.map(elem => elem[0]).join('');
            var captureNames = elems.map(elem => elem[1]).filter(name => !!name);
            return { source: text(), signature, captureNames };
        }
    /   "∅"   { return { source: text(), signature: "∅", captureNames: [] }; }

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
