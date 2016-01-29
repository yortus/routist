'use strict';
import {expect} from 'chai';
import Router from '../../src/routers/router';


// TODO: More coverage:
// - multiple non-decorator handlers for same pattern
// - multiple decorator handlers for same pattern
// - one decorator and some non-decorators for same pattern
// - decorators along ambiguous paths (same decorators on all paths)
// - decorators along ambiguous paths (not same decorators on all paths)


describe('Constructing a router instance', () => {

    let routeTable: {[pattern: string]: Function} = {
        '/foo': () => 'foo',
        '/bar': () => 'bar',
        '/baz': () => 'baz',
        '/*': ($req, $next) => `---${$next.execute($req) || 'NONE'}---`,

        'a/*': () => `starts with 'a'`,
        '*/b': () => `ends with 'b'`,
        'a/b': () => `starts with 'a' AND ends with 'b'`,

        'c/*': () => `starts with 'c'`,
        '*/d': () => `ends with 'd'`,
        'c/d': () => null,

        'api/**': () => `fallback`,
        'api/foo': () => 'FOO',
        'api/bar': () => null,
    };

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
