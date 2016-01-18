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
  *m*z
    a*m*z
  *z
    a*z
      a*m*z
    *m*z
      a*m*z
  *m*
    *m*z
      a*m*z
    a*m*
      a*m*z
  a*z
    a*m*z
  a*
    a*z
      a*m*z
    a*m*
      a*m*z
  a*m*
    a*m*z
  /*/b
    /*z/b
      /*o*o*z/b
    /*o*o*/b
      /*o*o*z/b
    /a/b
  /a/*
    /a/*o*o*
      /a/*o*o*.html
    /a/b
  /*o*o*/b
    /*o*o*z/b
  /…o…o…
    /*o*o*/b
      /*o*o*z/b
    /…o…o….html
      /a/*o*o*.html
      /*o*o*.html
      /foo/*.html
    /a/*o*o*
      /a/*o*o*.html
    /*o*o*
      /foo
      /*o*o*.html
  /*z/b
    /*o*o*z/b
  /*
    /*o*o*
      /foo
      /*o*o*.html
    /bar`;    
    
    it('works', () => {
        let family = makeRouteFamily(patterns);
        let actual = stringify(family);
        console.log(actual);
        expect(actual).equals(expected);
    });
});


function stringify(node: Node): string {
        let result = `${node.pattern}`;// (${node.handlers.length})`;
        result += node.specializations.map(spec => '\n' + stringify(spec).split('\n').map(line => '  ' + line).join('\n')).join('');
        return result;
}
let dummy = false ? makeRouteFamily([]) : null;
type Node = typeof dummy;
