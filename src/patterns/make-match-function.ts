'use strict';
import {PatternAST} from './parse-pattern-source';





/** Internal function used to create the Pattern#match method. */
export default function makeMatchFunction(patternSource: string, patternAST: PatternAST) {

    // Gather information about the pattern to be matched.
    let simplifiedPatternSignature = patternAST.signature.replace(/[^*…]+/g, 'LITERAL');
    let literalPart = patternAST.signature.replace(/[*…]/g, '');
    let captureNames = patternAST.captures.filter(capture => capture !== '?');
    let hasCaptureNames = captureNames.length > 0;
    let firstCaptureName = captureNames[0];

    // Construct the match function, using optimizations where possible.
    // Pattern matching may be done frequently, possibly on a critical path.
    // For simpler patterns, we can avoid the overhead of using a regex.
    // The switch block below picks out some simpler cases and provides
    // specialized match functions for them. The default case falls back
    // to using a regex. Note that all but the default case below could be
    // commented out with no change in runtime behaviour. The additional
    // cases are strictly optimizations.
    let matchFunction: MatchFunction;
    switch (simplifiedPatternSignature) {
        case 'LITERAL':
            matchFunction = (address: string) => address === patternSource ? SUCCESSFUL_MATCH_WITH_NO_CAPTURES : null;
            break;

        case '*':
        case '…':
            matchFunction = (address: string) => {
                if (simplifiedPatternSignature === '*' && address.indexOf('/') !== -1) return null;
                return hasCaptureNames ? {[firstCaptureName]: address} : SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
            }
            break;

        case 'LITERAL*':
        case 'LITERAL…':
            matchFunction = (address: string) => {
                let i = address.indexOf(literalPart);
                if (i !== 0) return null;
                let captureValue = address.slice(literalPart.length);
                if (simplifiedPatternSignature === 'LITERAL*' && captureValue.indexOf('/') !== -1) return null;
                return hasCaptureNames ? {[firstCaptureName]: captureValue} : SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
            };
            break;

        case '*LITERAL':
        case '…LITERAL':
            matchFunction = (address: string) => {
                let i = address.lastIndexOf(literalPart);
                if (i === -1 || i !== address.length - literalPart.length) return null;
                let captureValue = address.slice(0, -literalPart.length);
                if (simplifiedPatternSignature === 'LITERAL*' && captureValue.indexOf('/') !== -1) return null;
                return hasCaptureNames ? {[firstCaptureName]: captureValue} : SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
            };
            break;

        default:
            let recogniser = makeAddressRecogniser(patternAST);
            matchFunction = (address: string) => {
                let matches = address.match(recogniser);
                if (!matches) return null;
                let result = captureNames
                    .reduce((hash, name, i) => (hash[name] = matches[i + 1], hash), <any>{});
                return result;
            };
    }

    // Return the match function.
    return matchFunction;
}





/** Describes the signature of the Pattern#match method. */
type MatchFunction  = (address: string) => {[captureName: string]: string};





/**
 * Constructs a regular expression that matches all addresses recognised by the given pattern.
 * Each globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makeAddressRecogniser(patternAST: PatternAST) {
    let captureIndex = 0;
    let re = patternAST.signature.split('').map(c => {
        if (c === '*') {
            let isAnonymous = patternAST.captures[captureIndex++] === '?';
            return isAnonymous ? '[^\\/]*' : '([^\\/]*)';
        }
        if (c === '…') {
            let isAnonymous = patternAST.captures[captureIndex++] === '?';
            return isAnonymous ? '.*' : '(.*)';
        }
        if ('/._-'.indexOf(c) !== -1) {
            return `\\${c}`;
        }
        return c;
    }).join('');
    return new RegExp(`^${re}$`);
}





// Make a singleton match result that may be returned in all cases of a successful
// match with no named captures. This reduces the number of cases where calls to match
// functions create new heap objects.
const SUCCESSFUL_MATCH_WITH_NO_CAPTURES = <{[captureName: string]: string}> {};
Object.freeze(SUCCESSFUL_MATCH_WITH_NO_CAPTURES);
