'use strict';


import {expect} from 'chai';
import {RoutePattern, RoutePatternRelation as Relation, RouteFamily} from '..';


describe('a RouteFamily instance', () => {


    it('works', () => {
        var patterns = [
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

        let expected = `…
              /bar
              /…o…o…
                /foo
                /foo/bar
                /…o…o….html
                  /foo/….html
                    /foo/*.html`;

        let family = new RouteFamily(RoutePattern.ALL);
        patterns.forEach(test => {
            let pattern = new RoutePattern(test);
            family.add(pattern);
        });
        let actual = family.toString();
        //expect(actual).equals(expected.replace(/\n            /g, '\n'));
        console.log(actual);
    });
});
