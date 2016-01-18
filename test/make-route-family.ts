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
        '…',
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
        '/*z/b',
    ];

    let expected = `…
  a*
    a*m*
      a*m*z
    a*z
      a*m*z
  *m*
    a*m*
      a*m*z
    *m*z
      a*m*z
  *z
    a*z
      a*m*z
    *m*z
      a*m*z
  /*
    /bar
    /*o*o*
      /foo
      /*o*o*.html
  /…o…o…
    /*o*o*
      /foo
      /*o*o*.html
    /…o…o….html
      /*o*o*.html
      /foo/*.html
      /a/*o*o*.html
    /a/*o*o*
      /a/*o*o*.html
    /*o*o*/b
      /*o*o*z/b
  /a/*
    /a/*o*o*
      /a/*o*o*.html
    /a/b
  /*/b
    /*o*o*/b
      /*o*o*z/b
    /a/b
    /*z/b
      /*o*o*z/b
  /*z/b
    /*o*o*z/b
  a*m*
    a*m*z
  a*z
    a*m*z
  *m*z
    a*m*z
  /*o*o*/b
    /*o*o*z/b`;    
    
    it('works', () => {
        let family = makeRouteFamily(patterns);
        let actual = stringify(family);
        console.log(actual);
        expect(actual).equals(expected);
    });
});


function stringify(node: Node): string {
        let result = `${node.pattern}`;// (${node.handlers.length})`;
        let specs = Array.from(node.specializations.values());
        
        result += specs.map(spec => '\n' + stringify(spec).split('\n').map(line => '  ' + line).join('\n')).join('');
        return result;
}
let dummy = false ? makeRouteFamily([]) : null;
type Node = typeof dummy;
