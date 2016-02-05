'use strict';
var get_keys_deep_1 = require('./get-keys-deep');
var pattern_1 = require('../patterns/pattern');
// TODO: ...
function makeDecisionTree(patternHierarchy) {
    // TODO: ...
    var patternSignatures = get_keys_deep_1.default(patternHierarchy);
    var patternMatchers = patternSignatures.reduce(function (map, sig) {
        var p = new pattern_1.default(sig);
        map[sig] = function (address) { return p.match(address) !== null; };
        return map;
    }, {});
    // TODO: ...
    function getPrologLines(patterns) {
        var lines = Object.keys(patterns).map(function (signature) {
            var id = getIdForPatternSignature(signature, '__', '__');
            return [
                ("let " + id + " = patternMatchers['" + signature + "'];")
            ].concat(getPrologLines(patterns[signature]));
        });
        return dedupe((_a = []).concat.apply(_a, lines));
        var _a;
    }
    // TODO: doc...
    function getBodyLines(thisPattern, childPatterns) {
        var childLines = Object.keys(childPatterns).map(function (signature, i) {
            var id = getIdForPatternSignature(signature, '__', '__');
            return [
                ((i > 0 ? 'else ' : '') + "if (" + id + "(address)) {")
            ].concat(getBodyLines(signature, childPatterns[signature]).map(function (line) { return '    ' + line; }), [
                "}"
            ]);
        });
        var lastLine = (childLines.length > 0 ? 'else ' : '') + "return '" + thisPattern + "';";
        return (_a = []).concat.apply(_a, childLines.concat([lastLine]));
        var _a;
    }
    var lines = getPrologLines(patternHierarchy['…']).concat([
        '',
        'return function getBestMatchingPatternSignature(address) {'
    ], getBodyLines('…', patternHierarchy['…']).map(function (line) { return '    ' + line; }), [
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