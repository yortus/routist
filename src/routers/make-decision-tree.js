'use strict';
// import * as assert from 'assert';
// import {inspect} from 'util';
var get_keys_deep_1 = require('./get-keys-deep');
var pattern_1 = require('../patterns/pattern');
// TODO: ...
function makeDecisionTree(patternHierarchy) {
    if (1 === 1)
        return test(patternHierarchy);
    // TODO: ...
    var patternSignatures = get_keys_deep_1.default(patternHierarchy);
    var quickMatchers = patternSignatures.reduce(function (map, sig) {
        var p = new pattern_1.default(sig);
        map[sig] = function quickMatch(address) { return p.match(address) !== null; };
        return map;
    }, {});
    // TODO: ...
    function getBestMatchingPatternSignature(address, currentBest, moreSpecificCandidates) {
        // Construct a function that tries all the more specific candidates.
        var candidateSignatures = Object.keys(moreSpecificCandidates);
        var candidateMatchers = candidateSignatures.map(function (sig) { return quickMatchers[sig]; });
        function tryMoreSpecificCandidates(address) {
            for (var i = 0; i < candidateMatchers.length; ++i) {
                if (candidateMatchers[i](address))
                    return candidateSignatures[i];
            }
            return null;
        }
        var better = tryMoreSpecificCandidates(address);
        if (!better)
            return currentBest;
        return getBestMatchingPatternSignature(address, better, moreSpecificCandidates[better]);
    }
    ;
    // TODO: ...
    return function (address) { return getBestMatchingPatternSignature(address, '…', patternHierarchy['…']); };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDecisionTree;
function test(patternHierarchy) {
    // TODO: ...
    var patternSignatures = get_keys_deep_1.default(patternHierarchy);
    var patternMatchers = patternSignatures.reduce(function (map, sig) {
        var p = new pattern_1.default(sig);
        map[sig] = function (address) { return p.match(address) !== null; };
        return map;
    }, {});
    // TODO: ...
    //     function getIdsForPatterns(patterns: PatternHierarchy, prefix?: string): string[] {
    //         let result: string[] = [];
    //         Object.keys(patterns).forEach((sig, i) => {
    //             let id = `${prefix || ''}_${i}`;
    //             let rest = getIdsForPatterns(patterns[sig], id);
    //             result.push(id);
    //             result.push.apply(result, rest);
    //         });
    //         return result;
    //     }
    //     let ids = getIdsForPatterns(patternHierarchy);
    //     console.log(ids);
    // debugger;    
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
    function getBodyLines(thisPattern, childPatterns, idPrefix, linePrefix) {
        linePrefix = linePrefix || '';
        var result = [];
        var signatures = Object.keys(childPatterns);
        if (signatures.length > 0) {
            signatures.forEach(function (sig, i) {
                var id = (idPrefix || '') + "_" + i;
                result.push("" + linePrefix + (i > 0 ? 'else ' : '') + "if (" + id + "(address)) {\n");
                result.push.apply(result, getBodyLines(sig, childPatterns[sig], id, linePrefix + '    '));
                result.push(linePrefix + "}\n");
            });
            result.push(linePrefix + "else {\n");
            result.push(linePrefix + "    return '" + thisPattern + "';\n");
            result.push(linePrefix + "}\n");
        }
        else {
            // TODO: ...
            result.push(linePrefix + "return '" + thisPattern + "';\n");
        }
        return result;
    }
    var body = getBodyLines('…', patternHierarchy['…']);
    var source = prolog.concat(body).map(function (line) { return '    ' + line; }).join('');
    var fn = eval("(function bestMatch(address) {\n" + source + "})");
    return fn;
}
// TODO: temp testing... non recursive optimised construction:
"\n    let _ = patternSignatures.map(sig => patterns[sig].match);\n    let match0 =    _['\u2026'];\n    let match1 =        _['/foo']\n    let match2 =            _['/foo/bar']\n    let match3 =                _['/foo/bar/baz']\n    let match4 =            _['/foo/baz']\n    let match5 =        _['/bar']\n\n\n    if (match1(addr)) {\n        if (match2(addr)) {\n            if (match3(addr)) {\n                return '/foo/bar/baz';\n            }\n            else {\n                return '/foo/bar';\n            }\n        }\n        else if (match4(addr)) {\n            return '/foo/baz';\n        }\n        else {\n            return '/foo';\n        }\n    }\n    else if (match5(addr)) {\n        return '/bar';\n    }\n    else {\n        return '\u2026';\n    }\n";
// TODO: temp testing... non recursive optimised construction:
"\n    if (false) {\n    }\n    else if (quickMatchFoo(addr)) {\n        if (false) {\n        }\n        else if (quickMatchFooBar(addr)) {\n            if (false) {\n            }\n            else if (quickMatchFooBarBaz(addr)) {\n                if (false) {\n                }\n                else {\n                    return '/foo/bar/baz';\n                }\n            }\n            else {\n                return '/foo/bar';\n            }\n        }\n        else if (quickMatchFooBaz(addr)) {\n            if (false) {\n            }\n            else {\n                return '/foo/baz';\n            }\n        }\n        else {\n            return '/foo';\n        }\n    }\n    else if (quickMatchBar(addr)) {\n        if (false) {\n        }\n        else {\n            return '/bar';\n        }\n    }\n    else {\n        return '\u2026';\n    }\n";
//# sourceMappingURL=make-decision-tree.js.map