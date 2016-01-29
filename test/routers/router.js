'use strict';
var chai_1 = require('chai');
var router_1 = require('../../src/routers/router');
describe('Constructing a router instance', () => {
    let routeTable = {
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
    let router = new router_1.default();
    router.add(routeTable);
    tests.forEach(test => it(test, () => {
        let pathname = test.split(' ==> ')[0];
        let expected = test.split(' ==> ')[1];
        let actual;
        try {
            actual = router.dispatch({ pathname: pathname });
        }
        catch (ex) {
            actual = 'ERROR: ' + ex.message;
            if (expected.slice(-3) === '...') {
                actual = actual.slice(0, expected.length - 3) + '...';
            }
        }
        chai_1.expect(actual).equals(expected);
    }));
});
//# sourceMappingURL=router.js.map