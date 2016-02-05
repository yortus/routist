'use strict';
var pattern_1 = require('../../src/patterns/pattern');
var hierarchize_patterns_1 = require('../../src/patterns/hierarchize-patterns');
var make_decision_tree_1 = require('../../src/routers/make-decision-tree');
// TODO: More coverage:
// - multiple non-decorator handlers for same pattern
// - multiple decorator handlers for same pattern
// - one decorator and some non-decorators for same pattern
// - decorators along ambiguous paths (same decorators on all paths)
// - decorators along ambiguous paths (not same decorators on all paths)
describe('Constructing a router instance', function () {
    var routeTable = {
        '/foo': function () { return 'foo'; },
        '/bar': function () { return 'bar'; },
        '/baz': function () { return 'baz'; },
        //'/*': ($req, $next) => `---${$next.execute($req) || 'NONE'}---`,
        'a/*': function () { return "starts with 'a'"; },
        '*/b': function () { return "ends with 'b'"; },
        'a/b': function () { return "starts with 'a' AND ends with 'b'"; },
        'c/*': function () { return "starts with 'c'"; },
        '*/d': function () { return "ends with 'd'"; },
        'c/d': function () { return null; },
        'api/** #a': function () { return "fallback"; },
        'api/** #b': function () { return "fallback"; },
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
        "/foo ==> ---foo---",
        "/bar ==> ---bar---",
        "/baz ==> ---baz---",
        "/quux ==> ---NONE---",
        "a/foo ==> starts with 'a'",
        "foo/b ==> ends with 'b'",
        "a/b ==> starts with 'a' AND ends with 'b'",
        "c/foo ==> starts with 'c'",
        "foo/d ==> ends with 'd'",
        "c/d ==> ERROR: ambiguous...",
        "api/ ==> fallback",
        "api/foo ==> FOO",
        "api/bar ==> fallback",
    ];
    it('works', function () {
        // let finalHandlers = test(routeTable);
        // console.log(finalHandlers);
        var patterns = Object.keys(routeTable).map(function (key) { return new pattern_1.default(key); });
        var patternHierarchy = hierarchize_patterns_1.default(patterns);
        var decisionTree = make_decision_tree_1.default(patternHierarchy);
        console.log(decisionTree.toString());
        var addresses = tests.map(function (test) { return test.split(' ==> ')[0]; });
        var decisions = addresses.map(decisionTree);
        addresses.forEach(function (addr, i) {
            console.log(addr + "   MAPS TO   " + decisions[i]);
        });
        //        test2(patternHierarchy);
    });
    //     let router = new Router();
    //     router.add(routeTable);
    // 
    //     tests.forEach(test => it(test, () => {
    //         let request = test.split(' ==> ')[0];
    //         let expected = test.split(' ==> ')[1];
    //         let actual: string;
    //         try {
    //             actual = <string> router.dispatch(request);
    //         }
    //         catch (ex) {
    //             actual = 'ERROR: ' + ex.message;
    //             if (expected.slice(-3) === '...') {
    //                 actual = actual.slice(0, expected.length - 3) + '...';
    //             }
    //         }
    //         expect(actual).equals(expected);
    //     }));
});
//# sourceMappingURL=router.js.map