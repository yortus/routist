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
        '/*a*': function ($req, $next) { return ("---" + ($next($req) || 'NONE') + "---"); },
        'a/*': function () { return "starts with 'a'"; },
        '*/b': function () { return "ends with 'b'"; },
        'a/b': function () { return "starts with 'a' AND ends with 'b'"; },
        'c/*': function () { return "starts with 'c'"; },
        '*/d': function () { return "ends with 'd'"; },
        'c/d': function () { return null; },
        'api/** #a': function () { return "fallback"; },
        'api/** #b': function () { return "fallback"; },
        'api/f*o': function () { return null; },
        'api/foo': function () { return 'FOO'; },
        'api/bar': function () { return null; },
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
        "api/foo ==> FOO",
        "api/bar ==> fallback",
    ];
    var ruleSetHandler = compile_rule_set_1.default(ruleSet);
    tests.forEach(function (test) { return it(test, function () {
        var request = test.split(' ==> ')[0];
        var expected = test.split(' ==> ')[1];
        if (expected === 'UNHANDLED')
            expected = null;
        var actual;
        try {
            actual = ruleSetHandler(request);
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