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
    function getPrologLines(patterns, getNextId) {
        var lines = Object.keys(patterns).map(function (sig, i) {
            var id = "_" + getNextId();
            return [
                ("let " + id + "   =   _['" + sig + "'];")
            ].concat(getPrologLines(patterns[sig], getNextId));
        });
        return (_a = []).concat.apply(_a, lines);
        var _a;
    }
    // TODO: doc...
    function getBodyLines(thisPattern, childPatterns, getNextId) {
        var childLines = Object.keys(childPatterns).map(function (signature, i) {
            var id = "_" + getNextId();
            return [
                ((i > 0 ? 'else ' : '') + "if (" + id + "(address)) {")
            ].concat(getBodyLines(signature, childPatterns[signature], getNextId).map(function (line) { return '    ' + line; }), [
                "}"
            ]);
        });
        var lastLine = (childLines.length > 0 ? 'else ' : '') + "return '" + thisPattern + "';";
        return (_a = []).concat.apply(_a, childLines.concat([lastLine]));
        var _a;
    }
    function makeGetNextId() {
        var id = 0;
        return function () { return ++id; };
    }
    debugger;
    var firstLine = "let _ = patternMatchers;";
    var prolog = getPrologLines(patternHierarchy['…'], makeGetNextId());
    var body = getBodyLines('…', patternHierarchy['…'], makeGetNextId());
    var source = [firstLine, ''].concat(prolog, [''], body).map(function (line) { return '    ' + line; }).join('\n') + '\n';
    var fn = eval("(function bestMatch(address) {\n" + source + "})");
    if (1 === 1)
        return fn;
    //     let lines = [
    //         'let _ = patternMatchers;',
    //         '',
    //         ...getPrologLines(patternHierarchy['…']),
    //         '',
    //         'return function bestMatch(address) {',
    //         ...getBodyLines('…', patternHierarchy['…']).map(line => '    ' + line),
    //         '};'
    //     ];
    // 
    //     let source2 = lines.join('\n') + '\n';
    //     console.log(source2);
    // debugger;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
function getIdForPatternSignature(signature, prefix) {
    return (prefix || '') + signature
        .split('')
        .map(function (c) {
        if (/[a-zA-Z0-9_]/.test(c))
            return c;
        if (c === '/')
            return '〳'; // (U+3033)
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
        .join('');
}
//# sourceMappingURL=make-decision-tree.js.map