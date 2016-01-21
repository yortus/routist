'use strict';
var router_1 = require('../src/router');
describe('Constructing a router instance', () => {
    it('works', () => {
        let routeTable = {
            '/foo': () => 'foo',
            '/bar': () => 'bar',
            '/baz': () => 'baz',
            '/{thing}': thing => thing,
            'a/*': () => { },
            '*/b': () => { },
        };
        let router = new router_1.default();
        router.add(routeTable);
    });
});
//# sourceMappingURL=router.js.map