'use strict';
import {expect} from 'chai';
//import makeRouteFamily from '../src/make-route-family';
import makeRouteFamily from '../src/make-route-family';


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

        let ps = makeRouteFamily(patterns);
        console.log(stringify(ps));
        //ps.forEach(p => console.log(p));
        
        // let routeList = patterns.map(pattern => ({ pattern, handler: nullHandler}));
        // let root = makeRouteFamily(routeList);
        // console.log(stringify(root));
    });
});


function stringify(node: Node): string {
        let result = `${node.pattern}`;// (${node.handlers.length})`;
        result += node.specializations.map(spec => '\n' + stringify(spec).split('\n').map(line => '  ' + line).join('\n')).join('');
        return result;
}
let dummy = false ? makeRouteFamily([]) : null;
type Node = typeof dummy;
