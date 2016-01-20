'use strict';
import parsePattern from './parse-pattern';





/**
 * A pattern recognizes a set of pathnames. It like a RegExp, but tailored
 * specifically to pathname recognition. Patterns are case-sensitive.
 */
export default class Pattern {


    /**
     * Constructs a Pattern instance.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    constructor(private source: string) {
        let patternAST = parsePattern(source); // TODO: also validates - should separate this
        let matcher = makeMatchFunction(source);
        this.signature = patternAST.signature;
        this.captureNames = patternAST.captureNames.filter(n => n !== '?');
        this.match = matcher;
    }


    /**
     * The signature of this pattern. Two patterns that match the same set of pathnames
     * are guaranteed to have the same signature.
     */
    signature: string;


    /**
     * An array of the named captures present in the pattern, in order. For example, the pattern
     * '{...path}/*.{ext}' will have a `captureNames` property with the value ['path', 'ext'].
     */
    captureNames: string[];


    /**
     * Attempts to match a given pathname against the pattern. For successful matches, a hash
     * is returned containing the name/value pairs for each named capture in the pattern. For
     * failed matches the return value is null.
     * @param {string} pathname - the pathname to match against the pattern.
     * @returns - null if the match failed, otherwise a hash of captured name/value pairs.
     */
    match: (pathname: string) => {[captureName: string]: string};


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises all pathnames (i.e., the universal set). */
    static UNIVERSAL = new Pattern('…');


    /** A singleton pattern that recognises no pathnames (i.e., the empty set). */
    static EMPTY = new Pattern('∅');
}





/** Internal function used to create the Pattern#match method. */
function makeMatchFunction(pattern: string) {

    // Gather information about the pattern to be matched.
    let patternAST = parsePattern(pattern);
    let patternSignature = patternAST.signature.replace(/[^*…]+/g, 'A');
    let literalPart = patternAST.signature.replace(/[*…]/g, '');
    let captureName0 = patternAST.captureNames[0];

    // Construct the match function, using optimizations where possible.
    // Pattern matching may be done frequently, possibly on a critical path.
    // For simpler patterns, we can avoid the overhead of using a regex.
    // The switch block below picks out some simpler cases and provides
    // specialized match functions for them. The default case falls back
    // to using a regex. Note that all but the default case below could be
    // commented out with no change in runtime behaviour. The additional
    // cases are strictly optimizations.
    let matchFunction: any;
    switch (patternSignature) {
        case 'A':
            matchFunction = (pathname: string) => pathname === pattern ? {} : null;
            break;

        case '*':
        case '…':
            matchFunction = (pathname: string) => {
                if (patternSignature === '*' && pathname.indexOf('/') !== -1) return null;
                if (captureName0 === '?') return {};
                return {[captureName0]: pathname};
            }
            break;

        case 'A*':
        case 'A…':
            matchFunction = (pathname: string) => {
                let i = pathname.indexOf(literalPart);
                if (i !== 0) return null;
                let captureValue = pathname.slice(literalPart.length);
                if (patternSignature === 'A*' && captureValue.indexOf('/') !== -1) return null;
                if (captureName0 === '?') return {};
                return {[captureName0]: captureValue};
            };
            break;

        case '*A':
        case '…A':
            matchFunction = (pathname: string) => {
                let i = pathname.lastIndexOf(literalPart);
                if (i === -1 || i !== pathname.length - literalPart.length) return null;
                let captureValue = pathname.slice(0, -literalPart.length);
                if (patternSignature === '*A' && captureValue.indexOf('/') !== -1) return null;
                if (captureName0 === '?') return {};
                return {[captureName0]: captureValue};
            };
            break;

        default:
            let recogniser = makePathnameRecogniser(patternAST.signature);
            matchFunction = (pathname: string) => {
                let matches = pathname.match(recogniser);
                if (!matches) return null;
                let result = patternAST.captureNames.reduce((result, name, i) => {
                    if (name !== '?') result[name] = matches[i + 1];
                    return result;
                }, <any> {});
                return result;
            };
    }

    // Return the match function.
    return matchFunction;
}





/**
 * Constructs a regular expression that matches all pathnames recognised by the given pattern.
 * Each globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makePathnameRecogniser(pattern: string) {
    let re = pattern.split('').map(c => {
        if (c === '*') return '([^\\/]*)';
        if (c === '…') return '(.*)';
        if ('/._-'.indexOf(c) !== -1) return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
