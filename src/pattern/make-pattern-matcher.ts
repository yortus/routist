'use strict';
import {PatternAST} from './parse-pattern-source';





/** Internal function used to create the Pattern#match method. */
export default function makePatternMatcher(patternSource: string, patternAST: PatternAST): MatchFunction {

    // Gather information about the pattern to be matched. The closures below refer to these.
    let captureNames = patternAST.captures.filter(capture => capture !== '?');
    let firstCapName = captureNames[0];
    let lit = patternAST.signature.replace(/[*…]/g, '');
    let litLen = lit.length;

    // Construct the match function, using optimizations where possible. Pattern matching may be
    // done frequently, possibly on a critical path. For simpler patterns, we can avoid the
    // overhead of using a regex. The switch block below picks out some simpler cases and provides
    // specialized match functions for them. The default case falls back to using a regex. Note
    // that all but the default case below could be commented out with no change in runtime
    // behaviour. The additional cases are strictly optimizations.
    let simplifiedPatternSignature = patternSource
        .replace(/{[^.}]+}/g, 'ᕽ')      // replace '{name}' with 'ᕽ'
        .replace(/{\.+[^}]+}/g, '﹍')    // replace '{...name}' with '﹍'
        .replace(/{…[^}]+}/g, '﹍')      // replace '{…name}' with '﹍'
        .replace(/\.\.\./g, '…')          // replace '...' with '…'
        .replace(/[^*…ᕽ﹍]+/g, 'lit')    // replace sequences of literal characters with 'lit'
        .replace(/ᕽ/g, '{cap}')         // replace named wildcard captures with '{cap}'
        .replace(/﹍/g, '{...cap}');     // replace named globstar captures with '{...cap}'
    switch (simplifiedPatternSignature) {
        case 'lit':
            return addr => addr === lit ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '*':
            return addr => addr.indexOf('/') === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case '{cap}':
            return addr => addr.indexOf('/') === -1 ? {[firstCapName]: addr} : null;

        case '…':
            return addr => SUCCESSFUL_MATCH_NO_CAPTURES;

        case '{...cap}':
            return addr => ({[firstCapName]: addr});

        case 'lit*':
            return addr => {
                if (addr.indexOf(lit) !== 0) return null;
                return addr.indexOf('/', litLen) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };

        case 'lit{cap}':
            return addr => {
                if (addr.indexOf(lit) !== 0) return null;
                return addr.indexOf('/', litLen) === -1 ? {[firstCapName]: addr.slice(litLen)} : null;
            };

        case 'lit…':
            return addr => addr.indexOf(lit) === 0 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;

        case 'lit{...cap}':
            return addr => addr.indexOf(lit) === 0 ? {[firstCapName]: addr.slice(litLen)} : null;

        case '*lit':
            return addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                if (addr.indexOf(lit, litStart) !== litStart) return null;
                return addr.lastIndexOf('/', litStart - 1) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };

        case '{cap}lit':
            return addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                if (addr.indexOf(lit, litStart) !== litStart) return null;
                return addr.lastIndexOf('/', litStart - 1) === -1 ? {[firstCapName]: addr.slice(0, litStart)} : null;
            };

        case '…lit':
            return addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                return addr.indexOf(lit, litStart) === litStart ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };

        case '{...cap}lit':
            return addr => {
                let litStart = addr.length - litLen;
                if (litStart < 0) return null;
                return addr.indexOf(lit, litStart) === litStart ? {[firstCapName]: addr.slice(0, litStart)} : null;
            };

        default:
            let recogniser = makeAddressRecogniser(patternAST);
            return addr => {
                let matches = addr.match(recogniser);
                if (!matches) return null;
                let result = captureNames
                    .reduce((hash, name, i) => (hash[name] = matches[i + 1], hash), <any>{});
                return result;
            };
    }
}





/** Describes the signature of the Pattern#match method. */
type MatchFunction  = (address: string) => {[captureName: string]: string};





/**
 * Constructs a regular expression that matches all addresses recognised by the given pattern. Each
 * named globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
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





// A singleton match result that may be returned in all cases of a successful
// match with no named captures. This reduces the number of cases where calls
// to match() functions create new heap objects.
const SUCCESSFUL_MATCH_NO_CAPTURES = <{[captureName: string]: string}> {};
Object.freeze(SUCCESSFUL_MATCH_NO_CAPTURES);
