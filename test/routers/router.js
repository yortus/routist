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
describe('Constructing a router instance', () => {
    let routeTable = {
        '/foo': () => 'foo',
        '/bar': () => 'bar',
        '/baz': () => 'baz',
        //'/*': ($req, $next) => `---${$next.execute($req) || 'NONE'}---`,
        'a/*': () => `starts with 'a'`,
        '*/b': () => `ends with 'b'`,
        'a/b': () => `starts with 'a' AND ends with 'b'`,
        'c/*': () => `starts with 'c'`,
        '*/d': () => `ends with 'd'`,
        'c/d': () => null,
        'api/** #a': () => `fallback`,
        'api/** #b': () => `fallback`,
        'api/foo': () => 'FOO',
        'api/bar': () => null,
    };
    let testTable2 = {
        '/** #latency': ($next) => null,
        '/** #addBlahHeader': ($next) => null,
        '/** #authorize': ($next) => null,
        '/api/{...path}': (path) => null,
        '/public/main.js': ($next) => null,
        '/public/main.js #1.jquery': () => null,
        '/public/main.js #2.cajon': () => null,
    };
    function compare(pat1, pat2) {
    }
    let priorities = [
        // Root-level decorators:
        'latency', 'authorize', 'addBlahHeader'
    ];
    let tests = [
        `/foo ==> ---foo---`,
        `/bar ==> ---bar---`,
        `/baz ==> ---baz---`,
        `/quux ==> ---NONE---`,
        `a/foo ==> starts with 'a'`,
        `foo/b ==> ends with 'b'`,
        `a/b ==> starts with 'a' AND ends with 'b'`,
        `c/foo ==> starts with 'c'`,
        `foo/d ==> ends with 'd'`,
        `c/d ==> ERROR: ambiguous...`,
        `api/ ==> fallback`,
        `api/foo ==> FOO`,
        `api/bar ==> fallback`,
    ];
    it('works', () => {
        // let finalHandlers = test(routeTable);
        // console.log(finalHandlers);
        let patterns = Object.keys(routeTable).map(key => new pattern_1.default(key));
        let patternHierarchy = hierarchize_patterns_1.default(patterns);
        let decisionTree = make_decision_tree_1.default(patternHierarchy);
        let addresses = tests.map(test => test.split(' ==> ')[0]);
        let decisions = addresses.map(decisionTree);
        addresses.forEach((addr, i) => {
            console.log(`${addr}   MAPS TO   ${decisions[i]}`);
        });
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