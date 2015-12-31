'use strict';


//import routist = require('..');
import {expect} from 'chai';
import RoutePattern = require('../src/route-pattern');


describe('it', () => {


    it('works', () => {

        var tests = [

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
            '…a* ∩ *z… = *z…a*',
            '*z… ∩ …a* = *z…a*',
            '*z* ∩ *a* = ERROR',
            'a*… ∩ …*a = ERROR',
            'a…* ∩ *…a = ERROR',
            'a* ∩ *a = ERROR',
            'a/… ∩ …/a = ERROR'
        ];

        tests.forEach(test => {
            let expected = test.split(' = ')[1];
            let lhs = test.split(' = ')[0].split(' ∩ ')[0];
            let rhs = test.split(' = ')[0].split(' ∩ ')[1];
            let actual: string;
            try {
                actual = 'ERROR';
                let a = new RoutePattern(lhs);
                let b = new RoutePattern(rhs);
                actual = a.intersectWith(b).canonical;
            }
            catch(ex) { }
            //console.log(`${test}   ==>   ${actual}`);
            console.log(`${test}   ==>   ${expected === actual ? 'OK' : 'FAIL'}`);
            expect(actual).equals(expected);
        });
    });
});
