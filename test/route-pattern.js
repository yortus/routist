'use strict';
var chai_1 = require('chai');
var __1 = require('..');
describe('a pattern string', () => {
    it('intersects with other pattern strings', () => {
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
            let actual;
            try {
                actual = 'ERROR';
                let a = __1.normalizePattern(lhs);
                let b = __1.normalizePattern(rhs);
                actual = __1.intersectPatterns(a, b);
            }
            catch (ex) { }
            //console.log(`${test}   ==>   ${actual}`);
            console.log(`${test}   ==>   ${expected === actual ? 'OK' : 'FAIL'}`);
            chai_1.expect(actual).equals(expected);
        });
    });
    it('matches against pathnames', () => {
        let rp = '/f*o/bar/{baz}z/{...rest}.html';
        let matchPattern = __1.makePatternMatcher(rp);
        let matches = matchPattern('/foo/bar/baz/some/more/stuff.html');
        chai_1.expect(matches).to.deep.equal({ baz: 'ba', rest: 'some/more/stuff' });
        // TODO: more examples...
    });
    it('compares with other pattern strings', () => {
        var tests = [
            '/ab* vs /ab* = ' + 1 /* Equal */,
            '/ab* vs /*b = ERROR',
            '/ab* vs /abc* = ' + 3 /* Superset */,
            '/f*o/**/{name}.html vs /f*/{...rest} = ' + 2 /* Subset */,
            '/ab* vs /xy* = ' + 4 /* Disjoint */,
            '/ab* vs /*xy = ' + 5 /* Overlapping */,
        ];
        tests.forEach(test => {
            let expected = test.split(' = ')[1];
            let lhs = test.split(' = ')[0].split(' vs ')[0];
            let rhs = test.split(' = ')[0].split(' vs ')[1];
            let actual;
            try {
                actual = 'ERROR';
                let a = __1.normalizePattern(lhs);
                let b = __1.normalizePattern(rhs);
                actual = __1.comparePatterns(a, b).toString();
            }
            catch (ex) { }
            //console.log(`${test}   ==>   ${actual}`);
            console.log(`${test}   ==>   ${expected === actual ? 'OK' : 'FAIL'}`);
            chai_1.expect(actual).equals(expected);
        });
    });
});
//# sourceMappingURL=route-pattern.js.map