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
    function getPrologLines(patterns, idPrefix) {
        var result = [];
        if (!idPrefix)
            result.push('let _ = patternMatchers;\n');
        Object.keys(patterns).forEach(function (sig, i) {
            var id = (idPrefix || '') + "_" + i;
            var first = "let " + id + "   =   _['" + sig + "'];\n";
            var rest = getPrologLines(patterns[sig], id);
            result.push(first);
            result.push.apply(result, rest);
        });
        return result;
    }
    var prolog = getPrologLines(patternHierarchy['…']);
    function getBodyLines(thisPattern, childPatterns, idPrefix) {
        var lines = [];
        var signatures = Object.keys(childPatterns);
        var hasKids = signatures.length > 0;
        if (hasKids) {
            signatures.forEach(function (sig, i) {
                var id = (idPrefix || '') + "_" + i;
                lines.push.apply(lines, [(i > 0 ? 'else ' : '') + "if (" + id + "(address)) {"].concat(getBodyLines(sig, childPatterns[sig], id).map(function (line) { return '    ' + line; }), ["}"]));
            });
        }
        lines.push((hasKids ? 'else ' : '') + "return '" + thisPattern + "';");
        return lines;
    }
    var body = getBodyLines('…', patternHierarchy['…']).map(function (line) { return line + '\n'; });
    var source = prolog.concat(['\n'], body).map(function (line) { return '    ' + line; }).join('');
    var fn = eval("(function bestMatch(address) {\n" + source + "})");
    return fn;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
//# sourceMappingURL=make-decision-tree.js.map