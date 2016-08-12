'use strict';
import {expect} from 'chai';
import {Pattern} from 'routist';


describe('Intersecting two patterns', () => {

    let tests = [
        '… ∩ ∅ = ∅',
        ' ∩ ∅ = ∅',
        'a ∩ ∅ = ∅',
        '∅ ∩ ∅ = ∅',
        '∅ ∩ a = ∅',
        '∅ ∩  = ∅',
        '∅ ∩ * = ∅',
        '∅ ∩ … = ∅',
        '* ∩ ∅∅ = ERROR',

        '/ab* ∩ /*b = ERROR',
        '/f*o*o*z ∩ /foo*baz = /foo*baz',
        '/*/f*o*o*baz ∩ /aaa/foo*z = /aaa/foo*baz',
        '/ab*b ∩ /a*bc = ∅',
        '/ab*b ∩ /a*bc* = ERROR',
        '/a*b ∩ /ab*ab = /ab*ab',
        '/a*b ∩ /ba*ab = ∅',
        '/*m*n* ∩ /*n*m* = ERROR',
        '/*m*n* ∩ /*n*m*n* = /*n*m*n*',
        '/ ∩ / = /',
        '/ ∩ /* = /',
        '/* ∩ /* = /*',
        '/* ∩ / = /',
        '/f ∩ / = ∅',
        '/ ∩ /f = ∅',

        '/a/b ∩ /* = ∅',
        '/a/b ∩ /*/*c* = ∅',
        '/a/*b ∩ /*/*c* = /a/*c*b',
        '/a/*b ∩ /*/*c*/* = ∅',
        '/foo/* ∩ /*/bar = /foo/bar',

        '/a/b ∩ /… = /a/b',
        '/a/b ∩ … = /a/b',
        '/ ∩ … = /',
        ' ∩ … = ',
        '….html ∩ … = ….html',
        '/foo/….html ∩ … = /foo/….html',
        '/foo/….html ∩ /foo/bar/*z/* = /foo/bar/*z/*.html',
        '/foo/….html ∩ /foo/bar/*z/… = /foo/bar/*z/….html',

        '/* ∩ /… = /*',
        '/*/* ∩ /… = /*/*',
        '/… ∩ /… = /…',
        '/… ∩ /*/* = /*/*',
        '/…/* ∩ /… = /…/*',
        '/*/… ∩ /… = /*/…',
        '/… ∩ /…/* = /…/*',
        '/… ∩ /*/… = /*/…',
        '/*/…/* ∩ /… = /*/…/*',
        '*/… ∩ …/* = ERROR',
        '*… ∩ …* = ERROR',
        'a… ∩ …a = ERROR',
        '*a… ∩ …a* = ERROR',
        '…a* ∩ *a… = ERROR',
        '…a* ∩ *z… = ERROR', // *a*z*, *z…a*
        '*z… ∩ …a* = ERROR', // *a*z*, *z…a*
        '*z* ∩ *a* = ERROR', // *a*z*, *z*a*
        'a*… ∩ …*a = ERROR',
        'a…* ∩ *…a = ERROR',
        'a* ∩ *a = ERROR',
        'a/… ∩ …/a = ERROR',

        '/o… ∩ /*z = /o*z',
        '/o…o… ∩ /*z = /o*o*z',
        '/o…o… ∩ /*z/b = /o*o*z/b',
        '/…o…o… ∩ /*z/b = /*o*o*z/b'
    ];

    tests.forEach(test => {
        it(test, () => {
            let lhsA = test.split(' = ')[0].split(' ∩ ')[0];
            let lhsB = test.split(' = ')[0].split(' ∩ ')[1];
            let rhs = test.split(' = ')[1];
            let actual: string, expected = rhs;
            try {
                actual = 'ERROR';
                let intersections = new Pattern(lhsA).intersect(new Pattern(lhsB));

                if (intersections.length === 0) {
                    actual = Pattern.EMPTY.toString();
                }
                else if (intersections.length === 1) {
                    actual = intersections[0].toString();
                }
                else {
                    throw new Error(`Intersection cannot be expressed as a single pattern.`);
                }

                // TODO: was...
                // actual = intersections[0];
            }
            catch(ex) { }
            expect(actual).equals(expected);
        });
    });
});
