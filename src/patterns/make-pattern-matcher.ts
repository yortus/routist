'use strict';
import {PatternAST} from './parse-pattern-source';
// TODO: revise all docs below...





/** Internal function used to create the Pattern#match method. */
export default function makePatternMatcher(patternSource: string, patternAST: PatternAST) {

    // Gather information about the pattern to be matched.
    let lit = patternAST.signature.replace(/[*…]/g, '');
    let litLen = lit.length;
    let captureNames = patternAST.captures.filter(capture => capture !== '?');
    let capName = captureNames[0];

    // Construct the match function, using optimizations where possible.
    // Pattern matching may be done frequently, possibly on a critical path.
    // For simpler patterns, we can avoid the overhead of using a regex.
    // The switch block below picks out some simpler cases and provides
    // specialized match functions for them. The default case falls back
    // to using a regex. Note that all but the default case below could be
    // commented out with no change in runtime behaviour. The additional
    // cases are strictly optimizations.
    let matchFunction: MatchFunction;
    let simplifiedPatternSignature = patternSource // TODO: explain this line...
        .replace(/\*\*/g, '…')
        .replace(/{[^.}]+}/g, 'ᕽ')
        .replace(/{\.+[^}]+}/g, '﹍')
        .replace(/[^*…ᕽ﹍]+/g, 'lit')
        .replace(/ᕽ/g, '{cap}')
        .replace(/﹍/g, '{...cap}');
    switch (simplifiedPatternSignature) {
        case 'lit':
            matchFunction = addr => addr === lit ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            break;

        case '*':
            matchFunction = addr => addr.indexOf('/') === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            break;

        case '{cap}':
            matchFunction = addr => addr.indexOf('/') === -1 ? {[capName]: addr} : null;
            break;

        case '…':
            matchFunction = addr => SUCCESSFUL_MATCH_NO_CAPTURES;
            break;

        case '{...cap}':
            matchFunction = addr => ({[capName]: addr});
            break;

        case 'lit*':
            matchFunction = addr => {
                if (addr.indexOf(lit) !== 0) return null;
                return addr.indexOf('/', lit.length) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };
            break;

        case 'lit{cap}':
            matchFunction = addr => {
                if (addr.indexOf(lit) !== 0) return null;
                if (addr.indexOf('/', lit.length) !== -1) return null;
                return {[capName]: addr.slice(lit.length)}
            };
            break;

        case 'lit…':
            matchFunction = addr => addr.indexOf(lit) === 0 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            break;

        case 'lit{...cap}':
            matchFunction = addr => addr.indexOf(lit) === 0 ? {[capName]: addr.slice(lit.length)} : null;
            break;

        case '*lit':
            matchFunction = addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                if (addr.indexOf(lit, litStart) !== litStart) return null;
                return addr.lastIndexOf('/', litStart - 1) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };
            break;

        case '{cap}lit':
            matchFunction = addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                if (addr.indexOf(lit, litStart) !== litStart) return null;
                return addr.lastIndexOf('/', litStart - 1) === -1 ? {[capName]: addr.slice(0, litStart)} : null;
            };
            break;

        case '…lit':
            matchFunction = addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                return addr.indexOf(lit, litStart) === litStart ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };
            break;

        case '{...cap}lit':
            matchFunction = addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                return addr.indexOf(lit, litStart) === litStart ? {[capName]: addr.slice(0, litStart)} : null;
            };
            break;

        default:
            let recogniser = makeAddressRecogniser(patternAST);
            matchFunction = addr => {
                let matches = addr.match(recogniser);
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





// TODO: describe optimisations performed below...
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
const SUCCESSFUL_MATCH_NO_CAPTURES = <{[captureName: string]: string}> {};
Object.freeze(SUCCESSFUL_MATCH_NO_CAPTURES);
