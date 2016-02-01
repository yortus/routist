'use strict';
var chai_1 = require('chai');
var pattern_1 = require('../../src/patterns/pattern');
describe('Constructing a Pattern instance', () => {
    let tests = [
        '/api/foo ==> /api/foo WITH []',
        '/api/foo/BAR ==> /api/foo/BAR WITH []',
        '/api/foo… ==> /api/foo… WITH []',
        '/api/foo** ==> /api/foo… WITH []',
        '/api/foo/** ==> /api/foo/… WITH []',
        '/api/foo/{...rest} ==> /api/foo/… WITH ["rest"]',
        '/API/f* ==> /API/f* WITH []',
        '/api/{foO}O ==> /api/*O WITH ["foO"]',
        '/…/{name}.{ext} ==> /…/*.* WITH ["name", "ext"]',
        '/**/{name}.{ext} ==> /…/*.* WITH ["name", "ext"]',
        '/{...aPath}/{name}.{ext} ==> /…/*.* WITH ["aPath", "name", "ext"]',
        '/-/./- ==> /-/./-',
        '/*** ==> ERROR',
        '/*… ==> ERROR',
        '/foo/{...rest}* ==> ERROR',
        '/foo/{name}{ext} ==> ERROR',
        '/$foo ==> ERROR',
        '/bar/? ==> ERROR',
        '{} ==> ERROR',
        '{a...} ==> ERROR',
        '{...} ==> ERROR',
        '{..} ==> ERROR',
        '{..a} ==> ERROR',
        '{foo-bar} ==> ERROR',
        '{"foo"} ==> ERROR',
        '{ ==> ERROR',
        '} ==> ERROR',
        '{{} ==> ERROR',
        '{}} ==> ERROR',
        '{$} ==> * WITH ["$"]',
        '{...__} ==> … WITH ["__"]',
        '#comment ==> ',
        '   #comment ==> ',
        '# /a/b/c   fsdfsdf ==> ',
        '/a/b#comment ==> /a/b',
        '/**/{name}.js   #12 ==> /…/*.js WITH ["name"]',
    ];
    tests.forEach(test => {
        it(test, () => {
            let patternSource = test.split(' ==> ')[0];
            let rhs = test.split(' ==> ')[1];
            let expectedSignature = rhs.split(' WITH ')[0];
            let expectedCaptureNames = eval(rhs.split(' WITH ')[1] || '[]');
            let actualSignature = 'ERROR';
            let actualCaptureNames = [];
            try {
                let pattern = new pattern_1.default(patternSource);
                actualSignature = pattern.signature;
                actualCaptureNames = pattern.captureNames;
            }
            catch (ex) { }
            chai_1.expect(actualSignature).equals(expectedSignature);
            chai_1.expect(actualCaptureNames).to.deep.equal(expectedCaptureNames);
        });
    });
});
describe('Matching a pattern against an address', () => {
    let tests = [
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
    tests.forEach(test => {
        it(test, () => {
            let isMatch = test.indexOf(' MATCHES ') !== -1;
            let split = isMatch ? ' MATCHES ' : ' DOES NOT MATCH ';
            let patternSource = test.split(split)[0];
            let rhs = test.split(split)[1];
            let address = rhs.split(' WITH ')[0];
            let expectedCaptures = isMatch ? eval(`(${rhs.split(' WITH ')[1]})`) || {} : null;
            let pattern = new pattern_1.default(patternSource);
            let actualCaptures = pattern.match(address);
            chai_1.expect(actualCaptures).to.deep.equal(expectedCaptures);
            if (!isMatch)
                return;
            let expectedCaptureNames = Object.keys(expectedCaptures);
            let actualCaptureNames = pattern.captureNames;
            chai_1.expect(actualCaptureNames).to.include.members(expectedCaptureNames);
            chai_1.expect(expectedCaptureNames).to.include.members(actualCaptureNames);
        });
    });
});
//# sourceMappingURL=pattern.js.map