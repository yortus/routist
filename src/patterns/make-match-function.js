'use strict';
// TODO: revise jsdoc...
// TODO: add separate tests for this?
/** Internal function used to create the Pattern#match method. */
function makeMatchFunction(patternAST) {
    // Gather information about the pattern to be matched.
    var patternSource = patternAST.source;
    var simplifiedPatternSignature = patternAST.signature.replace(/[^*…]+/g, 'A');
    var literalPart = patternAST.signature.replace(/[*…]/g, '');
    var captureName0 = patternAST.captureNames[0];
    // TODO: explain... so match() doesn't unnecessarily alloc new objs
    var SUCCESSFUL_MATCH_WITH_NO_CAPTURES = {};
    Object.freeze(SUCCESSFUL_MATCH_WITH_NO_CAPTURES);
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
        case 'A':
            matchFunction = function (address) { return address === patternSource ? SUCCESSFUL_MATCH_WITH_NO_CAPTURES : null; };
            break;
        case '*':
        case '…':
            matchFunction = function (address) {
                if (simplifiedPatternSignature === '*' && address.indexOf('/') !== -1)
                    return null;
                if (captureName0 === '?')
                    return SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
                return (_a = {}, _a[captureName0] = address, _a);
                var _a;
            };
            break;
        case 'A*':
        case 'A…':
            matchFunction = function (address) {
                var i = address.indexOf(literalPart);
                if (i !== 0)
                    return null;
                var captureValue = address.slice(literalPart.length);
                if (simplifiedPatternSignature === 'A*' && captureValue.indexOf('/') !== -1)
                    return null;
                if (captureName0 === '?')
                    return SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
                return (_a = {}, _a[captureName0] = captureValue, _a);
                var _a;
            };
            break;
        case '*A':
        case '…A':
            matchFunction = function (address) {
                var i = address.lastIndexOf(literalPart);
                if (i === -1 || i !== address.length - literalPart.length)
                    return null;
                var captureValue = address.slice(0, -literalPart.length);
                if (simplifiedPatternSignature === '*A' && captureValue.indexOf('/') !== -1)
                    return null;
                if (captureName0 === '?')
                    return SUCCESSFUL_MATCH_WITH_NO_CAPTURES;
                return (_a = {}, _a[captureName0] = captureValue, _a);
                var _a;
            };
            break;
        default:
            var recogniser = makeAddressRecogniser(patternAST.signature, patternAST.captureNames);
            matchFunction = function (address) {
                var matches = address.match(recogniser);
                if (!matches)
                    return null;
                var result = patternAST.captureNames
                    .filter(function (name) { return name !== '?'; })
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
function makeAddressRecogniser(pattern, captureNames) {
    var captureIndex = 0;
    var re = pattern.split('').map(function (c) {
        if (c === '*') {
            var isAnonymous = captureNames[captureIndex++] === '?';
            return isAnonymous ? '[^\\/]*' : '([^\\/]*)';
        }
        if (c === '…') {
            var isAnonymous = captureNames[captureIndex++] === '?';
            return isAnonymous ? '.*' : '(.*)';
        }
        if ('/._-'.indexOf(c) !== -1) {
            return "\\" + c;
        }
        return c;
    }).join('');
    return new RegExp("^" + re + "$");
}
//# sourceMappingURL=make-match-function.js.map