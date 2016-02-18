'use strict';
var make_pattern_identifier_1 = require('./make-pattern-identifier');
var pattern_1 = require('../pattern');
// TODO: factor/reduce repeated makePatternIdentifier calls...
// TODO: ...
// TODO: construct taxonomy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
function makeDispatcher(taxonomy, targetMap) {
    // TODO: ...
    var patterns = taxonomy.allPatterns;
    var targets = patterns.map(function (pat) { return targetMap.get(pat); });
    // TODO: doc...
    function getBody(specializations, fallback, nestDepth) {
        var indent = ' '.repeat(nestDepth * 4);
        var firstLines = specializations.map(function (spec, i) {
            var nextLevel = spec.specializations;
            var isLeaf = nextLevel.length === 0;
            var id = make_pattern_identifier_1.default(spec.pattern);
            var condition = "" + indent + (i > 0 ? 'else ' : '') + "if (matches_" + id + "(address)) ";
            var consequent = isLeaf ? "return _" + id + ";\n" : "{\n" + getBody(nextLevel, spec.pattern, nestDepth + 1) + indent + "}\n"; // TODO: shorten to <120
            return condition + consequent;
        });
        var lastLine = indent + "return _" + make_pattern_identifier_1.default(fallback) + ";\n";
        return firstLines.join('') + lastLine;
    }
    // TODO: doc...
    var lines = patterns.map(function (pat, i) { return ("let matches_" + make_pattern_identifier_1.default(pat) + " = patterns[" + i + "].match;\n"); }).concat(patterns.map(function (pat, i) { return ("let _" + make_pattern_identifier_1.default(pat) + " = targets[" + i + "];\n"); }), [
        '',
        'return function dispatch(address) {',
        getBody(taxonomy.specializations, pattern_1.default.UNIVERSAL, 1),
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
exports.default = makeDispatcher;
//# sourceMappingURL=make-dispatcher.js.map