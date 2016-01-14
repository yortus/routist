'use strict';
var make_route_family_1 = require('../src/make-route-family');
describe('generating a route family', () => {
    function nullHandler() { return null; }
    let patterns = [
        //        '/',
        //        '/foo',
        //        '/bar',
        //        '/baz',
        //        '/*',
        //        '/foo',
        //        '/bar',
        //        '/foo/*.html',
        //        '/foo/bar',
        //        '/bar',
        //        '/foo/….html',
        //        '/…o…o….html',
        //        '/bar',
        //        '/…o…o…',
        '/a/b',
        '/a/*',
        '/*/b',
    ];
    it('works', () => {
        let routeList = patterns.map(pattern => ({ pattern, handler: nullHandler }));
        let root = make_route_family_1.default(routeList);
        console.log(stringify(root));
    });
});
function stringify(node) {
    let result = `${node.pattern} (${node.handlers.length})`;
    result += node.specializations.map(spec => '\n' + stringify(spec).split('\n').map(line => '  ' + line).join('\n')).join('');
    return result;
}
let dummy = false ? make_route_family_1.default([]) : null;
//# sourceMappingURL=make-route-family.js.map