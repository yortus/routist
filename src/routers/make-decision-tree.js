'use strict';
var get_keys_deep_1 = require('../utils/get-keys-deep');
var make_match_function_1 = require('../patterns/make-match-function');
var pattern_1 = require('../patterns/pattern');
// TODO: ...
function makeDecisionTree(patternHierarchy) {
    // TODO: ...
    var normalizedPatterns = get_keys_deep_1.default(patternHierarchy);
    var patternMatchers = normalizedPatterns.reduce(function (map, npat) {
        var match = make_match_function_1.default(npat);
        map.set(npat, function (address) { return match(address) !== null; });
        return map;
    }, new Map());
    // TODO: ...
    function getPrologLines(patternHierarchy) {
        var lines = Array.from(patternHierarchy.keys()).map(function (npat) {
            var id = getIdForPattern(npat, '__', '__');
            return [
                ("let " + id + " = patternMatchers.get(new Pattern('" + npat + "'));")
            ].concat(getPrologLines(patternHierarchy.get(npat)));
        });
        return dedupe((_a = []).concat.apply(_a, lines));
        var _a;
    }
    // TODO: doc...
    function getBodyLines(thisPattern, childPatterns) {
        var childLines = Array.from(childPatterns.keys()).map(function (npat, i) {
            var id = getIdForPattern(npat, '__', '__');
            return [
                ((i > 0 ? 'else ' : '') + "if (" + id + "(address)) {")
            ].concat(getBodyLines(npat, childPatterns.get(npat)).map(function (line) { return '    ' + line; }), [
                "}"
            ]);
        });
        var lastLine = (childLines.length > 0 ? 'else ' : '') + "return new Pattern('" + thisPattern + "');"; // TODO: temp testing... DON'T construct new Pattern inst here!
        return (_a = []).concat.apply(_a, childLines.concat([lastLine]));
        var _a;
    }
    // TODO: doc...
    var lines = getPrologLines(patternHierarchy.get(pattern_1.default.UNIVERSAL)).concat([
        '',
        'return function getBestMatchingPattern(address) {'
    ], getBodyLines(pattern_1.default.UNIVERSAL, patternHierarchy.get(pattern_1.default.UNIVERSAL)).map(function (line) { return '    ' + line; }), [
        '};'
    ]);
    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    var fn = (function (Pattern) {
        var fn = eval("(() => {\n" + lines.join('\n') + "\n})")();
        return fn;
    })(pattern_1.default);
    return fn;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
// TODO: ...
function getIdForPattern(pattern, prefix, suffix) {
    return (prefix || '') + pattern.toString()
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
        throw new Error("Unrecognized character '" + c + "' in pattern '" + pattern + "'");
    })
        .join('') + (suffix || '');
}
// TODO: this is a util. Generalize to any element type. Use it also in/with getKeysDeep
function dedupe(strs) {
    var map = strs.reduce(function (map, str) { return (map[str] = true, map); }, {});
    return Object.keys(map);
}
//# sourceMappingURL=make-decision-tree.js.map