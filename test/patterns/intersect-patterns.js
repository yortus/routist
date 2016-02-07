'use strict';
var chai_1 = require('chai');
var intersect_patterns_1 = require('../../src/patterns/intersect-patterns');
var pattern_1 = require('../../src/patterns/pattern');
describe('Intersecting two pattern strings', function () {
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
        '…a* ∩ *z… = ERROR',
        '*z… ∩ …a* = ERROR',
        '*z* ∩ *a* = ERROR',
        'a*… ∩ …*a = ERROR',
        'a…* ∩ *…a = ERROR',
        'a* ∩ *a = ERROR',
        'a/… ∩ …/a = ERROR',
        '/o… ∩ /*z = /o*z',
        '/o…o… ∩ /*z = /o*o*z',
        '/o…o… ∩ /*z/b = /o*o*z/b',
        '/…o…o… ∩ /*z/b = /*o*o*z/b'
    ];
    tests.forEach(function (test) {
        it(test, function () {
            var lhsA = test.split(' = ')[0].split(' ∩ ')[0];
            var lhsB = test.split(' = ')[0].split(' ∩ ')[1];
            var rhs = test.split(' = ')[1];
            var actual, expected = rhs;
            try {
                actual = 'ERROR';
                actual = intersect_patterns_1.default(new pattern_1.default(lhsA), new pattern_1.default(lhsB)).toString();
            }
            catch (ex) { }
            chai_1.expect(actual).equals(expected);
        });
    });
});
//# sourceMappingURL=intersect-patterns.js.map