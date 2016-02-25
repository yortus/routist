'use strict';
var chai_1 = require('chai');
var compile_rule_set_1 = require('../../src/routing/compile-rule-set');
// TODO: More coverage:
// - multiple non-decorator handlers for same pattern
// - multiple decorator handlers for same pattern
// - one decorator and some non-decorators for same pattern
// - decorators along ambiguous paths (same decorators on all paths)
// - decorators along ambiguous paths (not same decorators on all paths)
describe('Constructing a Router instance', function () {
    var ruleSet = {
        //'**': () => null, // no-op catch-all rule (this would be implicitly present even if not listed here)
        '/foo': function () { return 'foo'; },
        '/bar': function () { return 'bar'; },
        '/baz': function () { return 'baz'; },
        '/*a*': function ($next) { return ("---" + ($next() || 'NONE') + "---"); },
        'a/*': function () { return "starts with 'a'"; },
        '*/b': function () { return "ends with 'b'"; },
        'a/b': function () { return "starts with 'a' AND ends with 'b'"; },
        'c/*': function () { return "starts with 'c'"; },
        '*/d': function () { return "ends with 'd'"; },
        'c/d': function () { return null; },
        'api/** #a': function () { return "fallback"; },
        'api/** #b': function () { return "fallback"; },
        'api/fo*o': function () { return null; },
        'api/fo* #2': function ($req, $next) { return ("fo2-(" + ($next($req) || 'NONE') + ")"); },
        'api/fo* #1': function ($req, $next) { return ("fo1-(" + ($next($req) || 'NONE') + ")"); },
        'api/foo ': function ($req, $next) { return (($next($req) || 'NONE') + "!"); },
        'api/foo': function () { return 'FOO'; },
        'api/foot': function () { return 'FOOt'; },
        'api/fooo': function () { return 'fooo'; },
        'api/bar': function () { return null; },
        'zzz/{...rest}': function ($next, rest) { return ("" + ($next({ address: rest.split('').reverse().join('') }) || 'NONE')); },
        'zzz/b*z': function ($req) { return ("" + $req.address); },
        'zzz/./*': function () { return 'forty-two'; }
    };
    // TODO: use or remove...
    //     let testTable23 = {
    //         '/** #latency':                 ($next) => null,
    //         '/** #addBlahHeader':           ($next) => null,
    //         '/** #authorize':               ($next) => null,
    //         '/api/{...path}':               (path) => null,
    //         '/public/main.js':              ($next) => null,
    //         '/public/main.js #1.jquery':    () => null,
    //         '/public/main.js #2.cajon':     () => null,
    //     };
    // 
    //     function compare(pat1, pat2) {
    //         
    //     }
    //     let priorities = [
    //         // Root-level decorators:
    //         'latency', 'authorize', 'addBlahHeader'
    //     ];
    var tests = [
        "/foo ==> foo",
        "/bar ==> ---bar---",
        "/baz ==> ---baz---",
        "/quux ==> UNHANDLED",
        "/qaax ==> ---NONE---",
        "/a ==> ---NONE---",
        "/ ==> UNHANDLED",
        "a/foo ==> starts with 'a'",
        "foo/b ==> ends with 'b'",
        "a/b ==> starts with 'a' AND ends with 'b'",
        "c/foo ==> starts with 'c'",
        "foo/d ==> ends with 'd'",
        "c/d ==> ERROR: Multiple possible fallbacks...",
        "api/ ==> fallback",
        "api/foo ==> fo2-(fo1-(FOO!))",
        "api/fooo ==> fo2-(fo1-(fooo))",
        "api/foooo ==> fo2-(fo1-(NONE))",
        "api/foooot ==> fo2-(fo1-(NONE))",
        "api/foot ==> fo2-(fo1-(FOOt))",
        "api/bar ==> fallback",
        "zzz/baz ==> zab",
        "zzz/booz ==> zoob",
        "zzz/looz ==> NONE",
        "zzz/./{whatever} ==> forty-two"
    ];
    var ruleSetHandler = compile_rule_set_1.default(ruleSet);
    tests.forEach(function (test) { return it(test, function () {
        var address = test.split(' ==> ')[0];
        var request = { address: address };
        var expected = test.split(' ==> ')[1];
        if (expected === 'UNHANDLED')
            expected = null;
        var actual;
        try {
            actual = ruleSetHandler(address, request);
        }
        catch (ex) {
            actual = 'ERROR: ' + ex.message;
            if (expected.slice(-3) === '...') {
                actual = actual.slice(0, expected.length - 3) + '...';
            }
        }
        chai_1.expect(actual).equals(expected);
    }); });
});
//# sourceMappingURL=router.js.map