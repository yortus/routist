'use strict';
import * as PEG from 'pegjs';





/** Holds the information associated with a successfully parsed pattern source string. */
export interface PatternAST {


    /**
     * The pattern in its normalized form (i.e. all named captures replaced with '*' and '…').
     * Any two patterns with the same signature are guaranteed to match the same set of addresses.
     */
    signature: string;


    /**
     * A string array whose elements correspond, in order, to the captures in the pattern.
     * Each element holds the name of its corresponding capture, or '?' if the corresponding
     * capture is anonymous (i.e. '*' or '…'). For example, the pattern '{...path}/*.{ext}'
     * has a `captures` value of ['path', '?', 'ext'].
     */
    captures: string[];
}





/**
 * Verifies that `patternSource` has a valid format, and returns abstract syntax information
 * about the pattern. Throws an error if `patternSource` is invalid. Consult the documentation
 * for further information about the pattern DSL.
 * @param {string} patternSource - the pattern source string to be parsed.
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
            var captures = elems.map(elem => elem[1]).filter(name => !!name);
            return { signature, captures };
        }
    /   "∅"   { return { signature: "∅", captures: [] }; }

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
