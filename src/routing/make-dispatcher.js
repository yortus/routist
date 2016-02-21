'use strict';
var make_pattern_identifier_1 = require('./make-pattern-identifier');
var pattern_1 = require('../pattern');
// TODO: factor/reduce repeated makePatternIdentifier calls...
// TODO: ...
// TODO: construct taxonomy from targets? ie don't need it as parameter, can calc it
// TODO: shorten sig to < 120chars
function makeDispatcher(taxonomy, targetMap) {
    // TODO: ...
    var patterns = taxonomy.allNodes.map(function (node) { return node.pattern; });
    var targets = patterns.map(function (pat) { return targetMap.get(pat); });
    // TODO: doc...
    var lines = patterns.map(function (pat, i) { return ("let matches_" + make_pattern_identifier_1.default(pat) + " = patterns[" + i + "].match;"); }).concat(patterns.map(function (pat, i) { return ("let _" + make_pattern_identifier_1.default(pat) + " = targets[" + i + "];"); }), [
        '',
        'return function dispatch(address) {'
    ], getBodyLines(taxonomy.rootNode.specializations, pattern_1.default.UNIVERSAL, 1), [
        '};'
    ]);
    // console.log(lines);
    // debugger;
    // TODO: temp testing... capture unmangled Pattern id... remove/fix this!!!
    var fn = eval("(() => {\n" + lines.join('\n') + "\n})")();
    // console.log(fn.toString());
    // debugger;
    return fn;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDispatcher;
// TODO: doc...
function getBodyLines(specializations, fallback, nestDepth) {
    var indent = '    '.repeat(nestDepth);
    var lines = [];
    specializations.forEach(function (node, i) {
        var id = make_pattern_identifier_1.default(node.pattern);
        var condition = "" + indent + (i > 0 ? 'else ' : '') + "if (matches_" + id + "(address)) ";
        var nextLevel = node.specializations;
        if (nextLevel.length === 0)
            return lines.push(condition + "return _" + id + ";");
        lines = lines.concat([
            (condition + "{")
        ], getBodyLines(nextLevel, node.pattern, nestDepth + 1), [
            (indent + "}")
        ]);
    });
    lines.push(indent + "return _" + make_pattern_identifier_1.default(fallback) + ";");
    return lines;
}
//# sourceMappingURL=make-dispatcher.js.map