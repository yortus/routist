'use strict';
import parsePattern from './parse-pattern';





// TODO: doc...
export default class Pattern {


    // TODO: doc...
    constructor(private source: string) {
        let patternAST = parsePattern(source); // TODO: also validates - should separate this
        let matcher = makeMatchFunction(source);
        this.signature = patternAST.canonical;
        this.captureNames = matcher.captureNames;
        this.match = matcher;
    }


    // TODO: doc...
    signature: string;


    // TODO: doc...
    captureNames: string[];


    // TODO: doc...
    match: (pathname: string) => {[captureName: string]: string};


    // TODO: doc...
    toString() { return this.source; }
}





/**
 * Returns a function that attempts to match a given pathname against `pattern`.
 * For successful matches, the returned function returns a hash containing the
 * name/value pairs for each named capture in the pattern. For failed matches,
 * the returned function returns null. The returned function has a property
 * `captureNames` that contains an array of the capture names present in the
 * pattern. For example, the pattern '{...path}/*.{ext}' will result in a matcher
 * function with a `captureNames` property with the value ['path', 'ext'].
 * NB: Pattern matching is case-sensitive.
 */
function makeMatchFunction(pattern: string) {

    // Gather information about the pattern to be matched.
    let patternAST = parsePattern(pattern);
    let patternSignature = patternAST.canonical.replace(/[^*…]+/g, 'A');
    let literalPart = patternAST.canonical.replace(/[*…]/g, '');
    let captureName0 = patternAST.captureNames[0];

    // Construct the matcher function, using optimizations where possible.
    // Pattern matching may be done frequently, possibly on a critical path.
    // For simpler patterns, we can avoid the overhead of using a regex.
    // The switch block below picks out some simpler cases and provides
    // specialized matcher functions for them. The default case falls back
    // to using a regex. Note that all but the default case below could be
    // commented out with no change in runtime behaviour. The additional cases
    // are strictly optimizations.
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
            let recogniser = makePathnameRecogniser(patternAST.canonical);
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

    // Return the matcher function.
    let match: MatchFunction = matchFunction;
    match.captureNames = patternAST.captureNames.filter(n => n !== '?');
    return match;
}


/** Describes the signature of the function returned by makePatternMatcher. */
interface MatchFunction {
    (pathname: string): {[name: string]: string};
    captureNames: string[];
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
