'use strict';
import {expect} from 'chai';
import Router from '../../src/routing/router';


// TODO: temp testing...
import test from '../../src/routing/router2';
import Pattern from '../../src/patterns/pattern';
import hierarchizePatterns from '../../src/patterns/hierarchize-patterns';
import makeDecisionTree from '../../src/routing/make-decision-tree';


// TODO: More coverage:
// - multiple non-decorator handlers for same pattern
// - multiple decorator handlers for same pattern
// - one decorator and some non-decorators for same pattern
// - decorators along ambiguous paths (same decorators on all paths)
// - decorators along ambiguous paths (not same decorators on all paths)


describe('Constructing a Router instance', () => {

    let routeTable: {[pattern: string]: Function} = {
        '**': () => null, // no-op catch-all rule (tests for 'clash' with always-added 404 rule)
        '/foo': () => 'foo',
        '/bar': () => 'bar',
        '/baz': () => 'baz',
        '/*a*': ($req, $next) => `---${$next($req) || 'NONE'}---`,

        'a/*': () => `starts with 'a'`,
        '*/b': () => `ends with 'b'`,
        'a/b': () => `starts with 'a' AND ends with 'b'`,

        'c/*': () => `starts with 'c'`,
        '*/d': () => `ends with 'd'`,
        'c/d': () => null,

        'api/** #a': () => `fallback`,
        'api/** #b': () => `fallback`, // TODO: temp testing, remove this...
        'api/f*o': () => null,
        'api/foo': () => 'FOO',
        'api/bar': () => null,
    };

    let testTable2 = {
        '/** #latency':                 ($next) => null,
        '/** #addBlahHeader':           ($next) => null,
        '/** #authorize':               ($next) => null,
        '/api/{...path}':               (path) => null,
        '/public/main.js':              ($next) => null,
        '/public/main.js #1.jquery':    () => null,
        '/public/main.js #2.cajon':     () => null,
    };

    function compare(pat1, pat2) {
        
    }
    let priorities = [
        // Root-level decorators:
        'latency', 'authorize', 'addBlahHeader'
    ];



    let tests = [
        `/foo ==> foo`,
        `/bar ==> ---bar---`,
        `/baz ==> ---baz---`,
        `/quux ==> ERROR: 404!`, // TODO: using temp error code... will fail when fixed
        `/qaax ==> ---NONE---`,
        `/a ==> ---NONE---`,
        `/ ==> ERROR: 404!`, // TODO: using temp error code... will fail when fixed

        `a/foo ==> starts with 'a'`,
        `foo/b ==> ends with 'b'`,
        `a/b ==> starts with 'a' AND ends with 'b'`,

        `c/foo ==> starts with 'c'`,
        `foo/d ==> ends with 'd'`,
        `c/d ==> ERROR: Multiple possible fallbacks...`,

        `api/ ==> fallback`,
        `api/foo ==> FOO`,
        `api/bar ==> fallback`,
    ];

    let router = new Router();
    router.add(routeTable);

    tests.forEach(test => it(test, () => {
        let request = test.split(' ==> ')[0];
        let expected = test.split(' ==> ')[1];
        let actual: string;
        try {
            actual = <string> router.dispatch(request);
        }
        catch (ex) {
            actual = 'ERROR: ' + ex.message;
            if (expected.slice(-3) === '...') {
                actual = actual.slice(0, expected.length - 3) + '...';
            }
        }
        expect(actual).equals(expected);
    }));
});