'use strict';
var get_keys_deep_1 = require('../utils/get-keys-deep');
var make_match_function_1 = require('../patterns/make-match-function');
var pattern_1 = require('../patterns/pattern');
// TODO: ...
function makeDecisionTree(patternHierarchy) {
    // TODO: ...
    var patterns = get_keys_deep_1.default(patternHierarchy);
    var patternMatchers = patterns.reduce(function (map, pat) {
        var match = make_match_function_1.default(pat.normalized.source);
        map[pat.source] = function (address) { return match(address) !== null; };
        return map;
    }, {});
    // TODO: ...
    function getPrologLines(patterns) {
        var lines = Array.from(patterns.keys()).map(function (pat) {
            var id = getIdForPatternSignature(pat.normalized.source, '__', '__');
            return [
                ("let " + id + " = patternMatchers['" + pat + "'];")
            ].concat(getPrologLines(patterns.get(pat)));
        });
        return dedupe((_a = []).concat.apply(_a, lines));
        var _a;
    }
    // TODO: doc...
    function getBodyLines(thisPattern, childPatterns) {
        var childLines = Array.from(childPatterns.keys()).map(function (pat, i) {
            var id = getIdForPatternSignature(pat.normalized.source, '__', '__');
            return [
                ((i > 0 ? 'else ' : '') + "if (" + id + "(address)) {")
            ].concat(getBodyLines(pat, childPatterns.get(pat)).map(function (line) { return '    ' + line; }), [
                "}"
            ]);
        });
        var lastLine = (childLines.length > 0 ? 'else ' : '') + "return '" + thisPattern + "';";
        return (_a = []).concat.apply(_a, childLines.concat([lastLine]));
        var _a;
    }
    var lines = getPrologLines(patternHierarchy.get(pattern_1.default.UNIVERSAL)).concat([
        '',
        'return function getBestMatchingPatternSignature(address) {'
    ], getBodyLines(pattern_1.default.UNIVERSAL, patternHierarchy.get(pattern_1.default.UNIVERSAL)).map(function (line) { return '    ' + line; }), [
        '};'
    ]);
    var fn = eval("(() => {\n" + lines.join('\n') + "\n})")();
    return fn;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
// TODO: ...
function getIdForPatternSignature(signature, prefix, suffix) {
    return (prefix || '') + signature
        .split('')
        .map(function (c) {
        if (/[a-zA-Z0-9_]/.test(c))
            return c;
        if (c === '/')
            return 'ﾉ'; // (U+FF89)
        if (c === '.')
            return 'ˌ'; // (U+02CC)
        if (c === '-')
            return 'ー'; // (U+30FC)
        if (c === ' ')
            return 'ㆍ'; // (U+318D)
        if (c === '…')
            return '﹍'; // (U+FE4D)
        if (c === '*')
            return 'ᕽ'; // (U+157D)
        throw new Error("Unrecognized character '" + c + "' in pattern signature '" + signature + "'");
    })
        .join('') + (suffix || '');
}
// TODO: this is a util. Use it also in/with getKeysDeep
function dedupe(strs) {
    var map = strs.reduce(function (map, str) { return (map[str] = true, map); }, {});
    return Object.keys(map);
}
//# sourceMappingURL=make-decision-tree.js.map