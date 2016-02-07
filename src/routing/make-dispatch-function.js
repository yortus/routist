'use strict';
var util_1 = require('../util');
var pattern_1 = require('../patterns/pattern');
// TODO: ...
// TODO: add param targets: Map<Pattern, T> and change return type to (address: string) => T
// TODO: construct patternHierarchy from targets? ie don't need it as parameter, can calc it
function makeDispatchFunction(patternHierarchy) {
    // TODO: ...
    var patterns = util_1.getAllGraphNodes(patternHierarchy);
    // TODO: doc...
    function getBody(specializations, fallback, nestDepth) {
        var indent = ' '.repeat(nestDepth * 4);
        var firstLines = Array.from(specializations.keys()).map(function (spec, i) {
            var nextLevel = specializations.get(spec);
            var isLeaf = nextLevel.size === 0;
            var id = getIdForPattern(spec);
            var condition = "" + indent + (i > 0 ? 'else ' : '') + "if (" + id + ".match(address)) ";
            var consequent = isLeaf ? "return " + id + ";\n" : "{\n" + getBody(nextLevel, spec, nestDepth + 1) + indent + "}\n";
            return condition + consequent;
        });
        var lastLine = indent + "return " + getIdForPattern(fallback) + ";\n";
        return firstLines.join('') + lastLine;
    }
    // TODO: doc...
    var lines = patterns.map(function (pat, i) { return ("let " + getIdForPattern(pat) + " = patterns[" + i + "];\n"); }).concat([
        '',
        'return function dispatch(address) {',
        getBody(patternHierarchy.get(pattern_1.default.UNIVERSAL), pattern_1.default.UNIVERSAL, 1),
        '};'
    ]);
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
exports.default = makeDispatchFunction;
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
//# sourceMappingURL=make-dispatch-function.js.map