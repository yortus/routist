'use strict';
var chai_1 = require('chai');
var pattern_1 = require('../../src/pattern');
describe('Matching a pattern against an address', function () {
    var tests = [
        '* MATCHES abc',
        '* DOES NOT MATCH abc/def',
        '… MATCHES abc',
        '… MATCHES abc/def',
        '{Name} MATCHES abc WITH { Name: "abc" }',
        '{name} DOES NOT MATCH abc/def',
        '{...path} MATCHES abc/def WITH { path: "abc/def" }',
        'aaa MATCHES aaa',
        'aa DOES NOT MATCH aaa',
        '…bbb MATCHES bbb',
        '**bbb MATCHES aaa/bbb',
        '…bbb DOES NOT MATCH bbbabb',
        '{x}/y MATCHES x/y WITH {x: "x"}',
        '{X}/Y MATCHES X/Y WITH {X: "X"}',
        '/foo/* DOES NOT MATCH /foo',
        '/foo/* MATCHES /foo/bar',
        '/** MATCHES /foo/bar',
        '/{a} MATCHES / WITH {a:""}',
        '/a/{b} MATCHES /a/ WITH {b:""}',
        '/{...a}/ MATCHES // WITH {a:""}',
        '/{...path} MATCHES /foo/bar WITH { path: "foo/bar" }',
        '*ab* MATCHES aaabbb',
        '*aaa* MATCHES aaabbb',
        '*aaa* MATCHES aaaaaa',
        '*bbb* MATCHES aaabbb',
        '*ab* DOES NOT MATCH AABB',
        '*AB* DOES NOT MATCH aabb',
        '*bbb* DOES NOT MATCH bb/baaabb',
        '/{lhs}/bbb/{...rhs} MATCHES /aaa/bbb/ccc/ddd WITH {lhs: "aaa", rhs: "ccc/ddd"}',
        '{lhs}/bbb/{...rhs} DOES NOT MATCH /aaa/bbb/ccc/ddd',
        '/f*o/bar/{baz}z/{...rest}.html MATCHES /foo/bar/baz/some/more/stuff.html WITH { baz: "ba", rest: "some/more/stuff" }'
    ];
    tests.forEach(function (test) {
        it(test, function () {
            var isMatch = test.indexOf(' MATCHES ') !== -1;
            var split = isMatch ? ' MATCHES ' : ' DOES NOT MATCH ';
            var patternSource = test.split(split)[0];
            var rhs = test.split(split)[1];
            var address = rhs.split(' WITH ')[0];
            var expectedCaptures = isMatch ? eval("(" + rhs.split(' WITH ')[1] + ")") || {} : null;
            var pattern = new pattern_1.default(patternSource);
            var actualCaptures = pattern.match(address);
            chai_1.expect(actualCaptures).to.deep.equal(expectedCaptures);
        });
    });
});
//# sourceMappingURL=make-pattern-matcher.js.map