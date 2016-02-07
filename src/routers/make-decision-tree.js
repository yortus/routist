'use strict';
var get_keys_deep_1 = require('../utils/get-keys-deep');
var pattern_1 = require('../patterns/pattern');
// TODO: ...
function makeDecisionTree(patternHierarchy) {
    // TODO: ...
    var normalizedPatterns = get_keys_deep_1.default(patternHierarchy);
    var patternMatchers = normalizedPatterns.reduce(function (map, npat) {
        var match = npat.match;
        map.set(npat, function (address) { return match(address) !== null; });
        return map;
    }, new Map());
    // TODO: ...
    function getProlog(patternHierarchy) {
        var lines = normalizedPatterns.map(function (npat, i) {
            var id = getIdForPattern(npat);
            return "let " + id + " = normalizedPatterns[" + i + "];\n";
        });
        return lines.join('');
    }
    // TODO: doc...
    function getBody(thisPattern, childPatterns, nestDepth) {
        var indent = ' '.repeat(nestDepth * 4);
        var childLines = Array.from(childPatterns.keys()).map(function (npat, i) {
            var childNode = childPatterns.get(npat);
            var id = getIdForPattern(npat);
            var result = "" + indent + (i > 0 ? 'else ' : '') + "if (" + id + ".match(address)) ";
            if (childNode.size === 0) {
                result += "return " + id + ";\n";
            }
            else {
                result += "{\n" + getBody(npat, childNode, nestDepth + 1) + indent + "}\n";
            }
            return result;
        });
        var lastLine = "" + indent + (childLines.length > 0 ? 'else ' : '') + "return " + getIdForPattern(thisPattern) + ";\n";
        return childLines.join('') + lastLine;
    }
    // TODO: doc...
    var lines = [
        getProlog(patternHierarchy.get(pattern_1.default.UNIVERSAL)),
        '',
        'return function getBestMatchingPattern(address) {',
        getBody(pattern_1.default.UNIVERSAL, patternHierarchy.get(pattern_1.default.UNIVERSAL), 1),
        '};'
    ];
    //console.log(lines);
    // debugger;
    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    var fn = (function (Pattern) {
        var fn = eval("(() => {\n" + lines.join('\n') + "\n})")();
        return fn;
    })(pattern_1.default);
    //console.log(fn.toString());
    //debugger;
    return fn;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
// TODO: ...
function getIdForPattern(pattern) {
    return '__' + pattern.toString()
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
        .join('') + '__';
}
//# sourceMappingURL=make-decision-tree.js.map