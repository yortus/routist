'use strict';
import parsePatternSource from './parse-pattern-source';





/**
 * Attempts to match a given address against the bound pattern. For successful matches, a
 * hash is returned containing the name/value pairs for each named capture in the pattern.
 * For failed matches the return value is null.
 * @param {string} address - the address to match against the pattern.
 * @returns {Object} null if the match failed, otherwise a hash of captured name/value pairs.
 */
export interface MatchFunction {
    (address: string): {[captureName: string]: string};
}





// TODO: revise jsdoc...
// TODO: add separate tests for this?
/** Internal function used to create the Pattern#match method. */
export default function makeMatchFunction(patternSource: string) {

    // Gather information about the pattern to be matched.
    let patternAST = parsePatternSource(patternSource); // TODO: Pattern ctor already called this! just pass in AST props directly?
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
    let matchFunction: MatchFunction;
    switch (patternSignature) {
        case 'A':
            matchFunction = (address: string) => address === patternSource ? {} : null;
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
                    .reduce((hash, name, i) => (hash[name] = matches[i + 1], hash), <any>{});
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
