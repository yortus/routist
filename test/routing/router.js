'use strict';
var chai_1 = require('chai');
var router_1 = require('../../src/routing/router');
// TODO: More coverage:
// - multiple non-decorator handlers for same pattern
// - multiple decorator handlers for same pattern
// - one decorator and some non-decorators for same pattern
// - decorators along ambiguous paths (same decorators on all paths)
// - decorators along ambiguous paths (not same decorators on all paths)
describe('Constructing a Router instance', function () {
    var routeTable = {
        '**': function () { return null; },
        '** #2': function () { return null; },
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
    var testTable2 = {
        '/** #latency': function ($next) { return null; },
        '/** #addBlahHeader': function ($next) { return null; },
        '/** #authorize': function ($next) { return null; },
        '/api/{...path}': function (path) { return null; },
        '/public/main.js': function ($next) { return null; },
        '/public/main.js #1.jquery': function () { return null; },
        '/public/main.js #2.cajon': function () { return null; },
    };
    function compare(pat1, pat2) {
    }
    var priorities = [
        // Root-level decorators:
        'latency', 'authorize', 'addBlahHeader'
    ];
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
    var router = new router_1.default();
    router.add(routeTable);
    tests.forEach(function (test) { return it(test, function () {
        var request = test.split(' ==> ')[0];
        var expected = test.split(' ==> ')[1];
        if (expected === 'UNHANDLED')
            expected = null;
        var actual;
        try {
            actual = router.dispatch(request);
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