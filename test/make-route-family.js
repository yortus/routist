'use strict';
//import makeRouteFamily from '../src/make-route-family';
var make_route_family_1 = require('../src/make-route-family');
describe('generating a route family', () => {
    function nullHandler() { return null; }
    let patterns = [
        'a*',
        '*m*',
        '*z',
        '/bar',
        '/*',
        '/foo',
        '/foo/*.html',
        '/…o…o….html',
        '/…o…o…',
        '/bar',
        'a*',
        '/a/*',
        '/*/b',
        '/a*/*',
        '/*z/b',
    ];
    it('works', () => {
        let ps = make_route_family_1.default(patterns);
        console.log(stringify(ps));
        //ps.forEach(p => console.log(p));
        // let routeList = patterns.map(pattern => ({ pattern, handler: nullHandler}));
        // let root = makeRouteFamily(routeList);
        // console.log(stringify(root));
    });
});
function stringify(node) {
    let result = `${node.pattern}`; // (${node.handlers.length})`;
    result += node.specializations.map(spec => '\n' + stringify(spec).split('\n').map(line => '  ' + line).join('\n')).join('');
    return result;
}
let dummy = false ? make_route_family_1.default([]) : null;
//# sourceMappingURL=make-route-family.js.map