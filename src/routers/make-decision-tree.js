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
        var lines = Object.keys(patterns).map(function (sig, i) {
            var id = (idPrefix || '') + "_" + i;
            return [
                ("let " + id + "   =   _['" + sig + "'];")
            ].concat(getPrologLines(patterns[sig], id));
        });
        return (_a = []).concat.apply(_a, lines);
        var _a;
    }
    // TODO: doc...
    function getBodyLines(thisPattern, childPatterns, idPrefix) {
        var childLines = Object.keys(childPatterns).map(function (signature, i) {
            var id = (idPrefix || '') + "_" + i;
            return [
                ((i > 0 ? 'else ' : '') + "if (" + id + "(address)) {")
            ].concat(getBodyLines(signature, childPatterns[signature], id).map(function (line) { return '    ' + line; }), [
                "}"
            ]);
        });
        var lastLine = (childLines.length > 0 ? 'else ' : '') + "return '" + thisPattern + "';";
        return (_a = []).concat.apply(_a, childLines.concat([lastLine]));
        var _a;
    }
    var firstLine = "let _ = patternMatchers;";
    var prolog = getPrologLines(patternHierarchy['…']);
    var body = getBodyLines('…', patternHierarchy['…']);
    var source = [firstLine, ''].concat(prolog, [''], body).map(function (line) { return '    ' + line; }).join('\n') + '\n';
    var fn = eval("(function bestMatch(address) {\n" + source + "})");
    //if (1===1)return fn;
    var lines = [
        'let _ = patternMatchers;',
        ''
    ].concat(getPrologLines(patternHierarchy['…']), [
        '',
        'return function bestMatch(address) {'
    ], getBodyLines('…', patternHierarchy['…']).map(function (line) { return '    ' + line; }), [
        '};'
    ]);
    var source2 = lines.join('\n') + '\n';
    console.log(source2);
    debugger;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
//# sourceMappingURL=make-decision-tree.js.map