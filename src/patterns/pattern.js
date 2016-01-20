'use strict';
var parse_pattern_1 = require('./parse-pattern');
/**
 * A pattern recognizes a set of pathnames. It like a RegExp, but tailored
 * specifically to pathname recognition. Patterns are case-sensitive.
 */
class Pattern {
    /**
     * Constructs a Pattern instance.
     * @param {string} source - the pattern specified as a pattern DSL string.
     */
    constructor(source) {
        this.source = source;
        let patternAST = parse_pattern_1.default(source); // TODO: also validates - should separate this
        let matcher = makeMatchFunction(source);
        this.signature = patternAST.signature;
        this.captureNames = patternAST.captureNames.filter(n => n !== '?');
        this.match = matcher;
    }
    /** Returns the source string with which this instance was constructed. */
    toString() { return this.source; }
}
/** A singleton pattern that recognises all pathnames (i.e., the universal set). */
Pattern.UNIVERSAL = new Pattern('…');
/** A singleton pattern that recognises no pathnames (i.e., the empty set). */
Pattern.EMPTY = new Pattern('∅');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Pattern;
/** Internal function used to create the Pattern#match method. */
function makeMatchFunction(pattern) {
    // Gather information about the pattern to be matched.
    let patternAST = parse_pattern_1.default(pattern);
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
    let matchFunction;
    switch (patternSignature) {
        case 'A':
            matchFunction = (pathname) => pathname === pattern ? {} : null;
            break;
        case '*':
        case '…':
            matchFunction = (pathname) => {
                if (patternSignature === '*' && pathname.indexOf('/') !== -1)
                    return null;
                if (captureName0 === '?')
                    return {};
                return { [captureName0]: pathname };
            };
            break;
        case 'A*':
        case 'A…':
            matchFunction = (pathname) => {
                let i = pathname.indexOf(literalPart);
                if (i !== 0)
                    return null;
                let captureValue = pathname.slice(literalPart.length);
                if (patternSignature === 'A*' && captureValue.indexOf('/') !== -1)
                    return null;
                if (captureName0 === '?')
                    return {};
                return { [captureName0]: captureValue };
            };
            break;
        case '*A':
        case '…A':
            matchFunction = (pathname) => {
                let i = pathname.lastIndexOf(literalPart);
                if (i === -1 || i !== pathname.length - literalPart.length)
                    return null;
                let captureValue = pathname.slice(0, -literalPart.length);
                if (patternSignature === '*A' && captureValue.indexOf('/') !== -1)
                    return null;
                if (captureName0 === '?')
                    return {};
                return { [captureName0]: captureValue };
            };
            break;
        default:
            let recogniser = makePathnameRecogniser(patternAST.signature);
            matchFunction = (pathname) => {
                let matches = pathname.match(recogniser);
                if (!matches)
                    return null;
                let result = patternAST.captureNames.reduce((result, name, i) => {
                    if (name !== '?')
                        result[name] = matches[i + 1];
                    return result;
                }, {});
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
function makePathnameRecogniser(pattern) {
    let re = pattern.split('').map(c => {
        if (c === '*')
            return '([^\\/]*)';
        if (c === '…')
            return '(.*)';
        if ('/._-'.indexOf(c) !== -1)
            return `\\${c}`;
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}
//# sourceMappingURL=pattern.js.map