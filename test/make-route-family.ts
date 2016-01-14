'use strict';
import {expect} from 'chai';
import makeRouteFamily from '../src/make-route-family';


describe('generating a route family', () => {

    function nullHandler() { return null; }

    let patterns = [
        '/',
        '/foo',
        '/bar',
        '/baz',
        '/*',

        '/foo',
        '/bar',
        '/foo/*.html',
        '/foo/bar',
        '/bar',
        '/foo/….html',
        '/…o…o….html',
        '/bar',
        '/…o…o…',

        '/a/*',
        '/*/b'
    ];
    
    it('works', () => {
        let routeList = patterns.map(pattern => ({ pattern, handler: nullHandler}));
        let root = makeRouteFamily(routeList);
        console.log(stringify(root));
    });
});


function stringify(node: Node): string {
        let result = `${node.pattern} (${node.handlers.length})`;
        result += node.specializations.map(spec => '\n' + stringify(spec).split('\n').map(line => '  ' + line).join('\n')).join('');
        return result;
}
let dummy = false ? makeRouteFamily([]) : null;
type Node = typeof dummy;
