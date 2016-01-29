'use strict';
var chai_1 = require('chai');
var router_1 = require('../../src/routers/router');
describe('Constructing a router instance', () => {
    let routeTable = {
        '/foo': () => 'foo',
        '/bar': () => 'bar',
        '/baz': () => 'baz',
        //'/{name}': $downstream => `---${$downstream.execute() || 'NONE'}---`,
        'a/*': () => `starts with 'a'`,
        '*/b': () => `ends with 'b'`,
    };
    let tests = [
        `/foo ==> foo`,
        `/bar ==> bar`,
        `/baz ==> baz`,
        `a/foo ==> starts with 'a'`,
        `foo/b ==> ends with 'b'`,
    ];
    let router = new router_1.default();
    router.add(routeTable);
    tests.forEach(test => it(test, () => {
        let pathname = test.split(' ==> ')[0];
        let expected = test.split(' ==> ')[1];
        let actual = router.dispatch({ pathname: pathname });
        chai_1.expect(actual).equals(expected);
    }));
});
//# sourceMappingURL=router.js.map