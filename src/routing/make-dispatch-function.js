'use strict';
var util_1 = require('../util');
var make_pattern_identifier_1 = require('./make-pattern-identifier');
var pattern_1 = require('../patterns/pattern');
// TODO: factor/reduce repeated makePatternIdentifier calls...
// TODO: ...
// TODO: construct patternHierarchy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
function makeDispatchFunction(patternHierarchy, targetMap) {
    // TODO: ...
    var patterns = util_1.getAllGraphNodes(patternHierarchy);
    var targets = patterns.map(function (pat) { return targetMap.get(pat); });
    // TODO: doc...
    function getBody(specializations, fallback, nestDepth) {
        var indent = ' '.repeat(nestDepth * 4);
        var firstLines = Array.from(specializations.keys()).map(function (spec, i) {
            var nextLevel = specializations.get(spec);
            var isLeaf = nextLevel.size === 0;
            var id = make_pattern_identifier_1.default(spec);
            var condition = "" + indent + (i > 0 ? 'else ' : '') + "if (matches" + id + "(address)) ";
            var consequent = isLeaf ? "return targetFor" + id + ";\n" : "{\n" + getBody(nextLevel, spec, nestDepth + 1) + indent + "}\n"; // TODO: shorten to <120
            return condition + consequent;
        });
        var lastLine = indent + "return targetFor" + make_pattern_identifier_1.default(fallback) + ";\n";
        return firstLines.join('') + lastLine;
    }
    // TODO: doc...
    var lines = patterns.map(function (pat, i) { return ("let matches" + make_pattern_identifier_1.default(pat) + " = patterns[" + i + "].match;\n"); }).concat(patterns.map(function (pat, i) { return ("let targetFor" + make_pattern_identifier_1.default(pat) + " = targets[" + i + "];\n"); }), [
        '',
        'return function dispatch(address) {',
        getBody(patternHierarchy.get(pattern_1.default.UNIVERSAL), pattern_1.default.UNIVERSAL, 1),
        '};'
    ]);
    // console.log(lines);
    // debugger;
    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    var fn = (function (Pattern) {
        var fn = eval("(() => {\n" + lines.join('\n') + "\n})")();
        return fn;
    })(pattern_1.default);
    // console.log(fn.toString());
    // debugger;
    return fn;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDispatchFunction;
//# sourceMappingURL=make-dispatch-function.js.map