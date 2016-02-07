'use strict';
/** Internal function used to create the Pattern#match method. */
function makeMatchFunction(patternSource, patternAST) {
    // Gather information about the pattern to be matched.
    var simplifiedPatternSignature = patternAST.signature.replace(/[^*…]+/g, 'LITERAL');
    var literalPart = patternAST.signature.replace(/[*…]/g, '');
    var captureNames = patternAST.captures.filter(function (capture) { return capture !== '?'; });
    var hasCaptureNames = captureNames.length > 0;
    var firstCaptureName = captureNames[0];
    // Construct the match function, using optimizations where possible.
    // Pattern matching may be done frequently, possibly on a critical path.
    // For simpler patterns, we can avoid the overhead of using a regex.
    // The switch block below picks out some simpler cases and provides
    // specialized match functions for them. The default case falls back
    // to using a regex. Note that all but the default case below could be
    // commented out with no change in runtime behaviour. The additional
    // cases are strictly optimizations.
    var matchFunction;
    switch (simplifiedPatternSignature) {
        case 'LITERAL':
            matchFunction = function (address) { return address === patternSource ? SUCCESSFUL_MATCH_WITH_NO_CAPTURES : null; };
            break;
        case '*':
        case '…':
            matchFunction = function (address) {
                if (simplifiedPatternSignature === '*' && address.indexOf('/') !== -1)
                    return null;
                return hasCaptureNames ? (_a = {}, _a[firstCaptureName] = address, _a) : SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
                var _a;
            };
            break;
        case 'LITERAL*':
        case 'LITERAL…':
            matchFunction = function (address) {
                var i = address.indexOf(literalPart);
                if (i !== 0)
                    return null;
                var captureValue = address.slice(literalPart.length);
                if (simplifiedPatternSignature === 'LITERAL*' && captureValue.indexOf('/') !== -1)
                    return null;
                return hasCaptureNames ? (_a = {}, _a[firstCaptureName] = captureValue, _a) : SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
                var _a;
            };
            break;
        case '*LITERAL':
        case '…LITERAL':
            matchFunction = function (address) {
                var i = address.lastIndexOf(literalPart);
                if (i === -1 || i !== address.length - literalPart.length)
                    return null;
                var captureValue = address.slice(0, -literalPart.length);
                if (simplifiedPatternSignature === 'LITERAL*' && captureValue.indexOf('/') !== -1)
                    return null;
                return hasCaptureNames ? (_a = {}, _a[firstCaptureName] = captureValue, _a) : SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
                var _a;
            };
            break;
        default:
            var recogniser = makeAddressRecogniser(patternAST);
            matchFunction = function (address) {
                var matches = address.match(recogniser);
                if (!matches)
                    return null;
                var result = captureNames
                    .reduce(function (hash, name, i) { return (hash[name] = matches[i + 1], hash); }, {});
                return result;
            };
    }
    // Return the match function.
    return matchFunction;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeMatchFunction;
/**
 * Constructs a regular expression that matches all addresses recognised by the given pattern.
 * Each globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
 */
function makeAddressRecogniser(patternAST) {
    var captureIndex = 0;
    var re = patternAST.signature.split('').map(function (c) {
        if (c === '*') {
            var isAnonymous = patternAST.captures[captureIndex++] === '?';
            return isAnonymous ? '[^\\/]*' : '([^\\/]*)';
        }
        if (c === '…') {
            var isAnonymous = patternAST.captures[captureIndex++] === '?';
            return isAnonymous ? '.*' : '(.*)';
        }
        if ('/._-'.indexOf(c) !== -1) {
            return "\\" + c;
        }
        return c;
    }).join('');
    return new RegExp("^" + re + "$");
}
// Make a singleton match result that may be returned in all cases of a successful
// match with no named captures. This reduces the number of cases where calls to match
// functions create new heap objects.
var SUCCESSFUL_MATCH_WITH_NO_CAPTURES = {};
Object.freeze(SUCCESSFUL_MATCH_WITH_NO_CAPTURES);
//# sourceMappingURL=make-match-function.js.map