'use strict';
import parsePatternSource from './parse-pattern-source';





/**
 * A pattern recognizes a set of addresses. It like a RegExp, but tailored
 * specifically to address recognition. Patterns are case-sensitive.
 */
export default class Pattern {


    /**
     * Constructs a Pattern instance.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    constructor(private source: string) {
        let patternAST = parsePatternSource(source);
        this.signature = patternAST.signature;
        this.captureNames = patternAST.captureNames.filter(n => n !== '?');
        this.match = makeMatchFunction(source);
    }


    /**
     * The signature of this pattern. Two patterns that match the same set of
     * addresses are guaranteed to have the same signature.
     */
    signature: string;


    /**
     * An array of the named captures present in the pattern, in order. For example, the pattern
     * '{...path}/*.{ext}' will have a `captureNames` property with the value ['path', 'ext'].
     */
    captureNames: string[];


    /**
     * Attempts to match a given address against the pattern. For successful matches, a hash
     * is returned containing the name/value pairs for each named capture in the pattern. For
     * failed matches the return value is null.
     * @param {string} address - the address to match against the pattern.
     * @returns {Object} null if the match failed, otherwise a hash of captured name/value pairs.
     */
    match: (address: string) => {[captureName: string]: string};


    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }


    /** A singleton pattern that recognises all addresses (i.e., the universal set). */
    static UNIVERSAL = new Pattern('…');


    /** A singleton pattern that recognises no addresses (i.e., the empty set). */
    static EMPTY = new Pattern('∅');
}





/** Internal function used to create the Pattern#match method. */
function makeMatchFunction(pattern: string) {

    // Gather information about the pattern to be matched.
    let patternAST = parsePatternSource(pattern);
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
            matchFunction = (address: string) => address === pattern ? {} : null;
            break;

        case '*':
        case '…':
            matchFunction = (address: string) => {
                if (patternSignature === '*' && address.indexOf('/') !== -1) return null;
                if (captureName0 === '?') return {};
                return {[captureName0]: address};
            }
            break;

        case 'A*':
        case 'A…':
            matchFunction = (address: string) => {
                let i = address.indexOf(literalPart);
                if (i !== 0) return null;
                let captureValue = address.slice(literalPart.length);
                if (patternSignature === 'A*' && captureValue.indexOf('/') !== -1) return null;
                if (captureName0 === '?') return {};
                return {[captureName0]: captureValue};
            };
            break;

        case '*A':
        case '…A':
            matchFunction = (address: string) => {
                let i = address.lastIndexOf(literalPart);
                if (i === -1 || i !== address.length - literalPart.length) return null;
                let captureValue = address.slice(0, -literalPart.length);
                if (patternSignature === '*A' && captureValue.indexOf('/') !== -1) return null;
                if (captureName0 === '?') return {};
                return {[captureName0]: captureValue};
            };
            break;

        default:
            let recogniser = makeAddressRecogniser(patternAST.signature, patternAST.captureNames);
            matchFunction = (address: string) => {
                let matches = address.match(recogniser);
                if (!matches) return null;
                let result = patternAST.captureNames
                    .filter(name => name !== '?')
                    .reduce((hash, name, i) => (hash[name] = matches[i + 1], hash), {});
                return result;
            };
    }

    // Return the match function.
    return matchFunction;
}





/**
 * Constructs a regular expression that matches all addresses recognised by the given pattern.
 * Each globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makeAddressRecogniser(pattern: string, captureNames: string[]) {
    let captureIndex = 0;
    let re = pattern.split('').map(c => {
        if (c === '*') {
            let isAnonymous = captureNames[captureIndex++] === '?';
            return isAnonymous ? '[^\\/]*' : '([^\\/]*)';
        }
        if (c === '…') {
            let isAnonymous = captureNames[captureIndex++] === '?';
            return isAnonymous ? '.*' : '(.*)';
        }
        if ('/._-'.indexOf(c) !== -1) {
            return `\\${c}`;
        }
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
