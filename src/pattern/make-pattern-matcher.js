'use strict';
/** Internal function used to create the Pattern#match method. */
function makePatternMatcher(patternSource, patternAST) {
    // Gather information about the pattern to be matched. The closures below refer to these.
    var captureNames = patternAST.captures.filter(function (capture) { return capture !== '?'; });
    var firstCapName = captureNames[0];
    var lit = patternAST.signature.replace(/[*…]/g, '');
    var litLen = lit.length;
    // Construct the match function, using optimizations where possible. Pattern matching may be
    // done frequently, possibly on a critical path. For simpler patterns, we can avoid the
    // overhead of using a regex. The switch block below picks out some simpler cases and provides
    // specialized match functions for them. The default case falls back to using a regex. Note
    // that all but the default case below could be commented out with no change in runtime
    // behaviour. The additional cases are strictly optimizations.
    var simplifiedPatternSignature = patternSource
        .replace(/\*\*/g, '…') // Each anonymous capture simplified to just '*' or '…'
        .replace(/{[^.}]+}/g, 'ᕽ')
        .replace(/{\.+[^}]+}/g, '﹍')
        .replace(/[^*…ᕽ﹍]+/g, 'lit') // Each sequence of literal characters simplified to 'lit'
        .replace(/ᕽ/g, '{cap}') // Each named wildcard capture simplified to '{cap}'
        .replace(/﹍/g, '{...cap}'); // Each named globstar capture simplified to '{...cap}'
    switch (simplifiedPatternSignature) {
        case 'lit':
            return function (addr) { return addr === lit ? SUCCESSFUL_MATCH_NO_CAPTURES : null; };
        case '*':
            return function (addr) { return addr.indexOf('/') === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null; };
        case '{cap}':
            return function (addr) { return addr.indexOf('/') === -1 ? (_a = {}, _a[firstCapName] = addr, _a) : null; var _a; };
        case '…':
            return function (addr) { return SUCCESSFUL_MATCH_NO_CAPTURES; };
        case '{...cap}':
            return function (addr) { return ((_a = {}, _a[firstCapName] = addr, _a)); var _a; };
        case 'lit*':
            return function (addr) {
                if (addr.indexOf(lit) !== 0)
                    return null;
                return addr.indexOf('/', litLen) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };
        case 'lit{cap}':
            return function (addr) {
                if (addr.indexOf(lit) !== 0)
                    return null;
                return addr.indexOf('/', litLen) === -1 ? (_a = {}, _a[firstCapName] = addr.slice(litLen), _a) : null;
                var _a;
            };
        case 'lit…':
            return function (addr) { return addr.indexOf(lit) === 0 ? SUCCESSFUL_MATCH_NO_CAPTURES : null; };
        case 'lit{...cap}':
            return function (addr) { return addr.indexOf(lit) === 0 ? (_a = {}, _a[firstCapName] = addr.slice(litLen), _a) : null; var _a; };
        case '*lit':
            return function (addr) {
                var litStart = addr.length - litLen;
                if (litStart < 0)
                    return null;
                if (addr.indexOf(lit, litStart) !== litStart)
                    return null;
                return addr.lastIndexOf('/', litStart - 1) === -1 ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };
        case '{cap}lit':
            return function (addr) {
                var litStart = addr.length - litLen;
                if (litStart < 0)
                    return null;
                if (addr.indexOf(lit, litStart) !== litStart)
                    return null;
                return addr.lastIndexOf('/', litStart - 1) === -1 ? (_a = {}, _a[firstCapName] = addr.slice(0, litStart), _a) : null;
                var _a;
            };
        case '…lit':
            return function (addr) {
                var litStart = addr.length - litLen;
                if (litStart < 0)
                    return null;
                return addr.indexOf(lit, litStart) === litStart ? SUCCESSFUL_MATCH_NO_CAPTURES : null;
            };
        case '{...cap}lit':
            return function (addr) {
                var litStart = addr.length - litLen;
                if (litStart < 0)
                    return null;
                return addr.indexOf(lit, litStart) === litStart ? (_a = {}, _a[firstCapName] = addr.slice(0, litStart), _a) : null;
                var _a;
            };
        default:
            var recogniser = makeAddressRecogniser(patternAST);
            return function (addr) {
                var matches = addr.match(recogniser);
                if (!matches)
                    return null;
                var result = captureNames
                    .reduce(function (hash, name, i) { return (hash[name] = matches[i + 1], hash); }, {});
                return result;
            };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makePatternMatcher;
/**
 * Constructs a regular expression that matches all addresses recognised by the given pattern. Each
 * named globstar/wildcard in the pattern corresponds to a capture group in the regular expression.
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
// A singleton match result that may be returned in all cases of a successful
// match with no named captures. This reduces the number of cases where calls
// to match() functions create new heap objects.
var SUCCESSFUL_MATCH_NO_CAPTURES = {};
Object.freeze(SUCCESSFUL_MATCH_NO_CAPTURES);
//# sourceMappingURL=make-pattern-matcher.js.map