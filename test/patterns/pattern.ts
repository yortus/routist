'use strict';
import {expect} from 'chai';
import makeMatchFunction from '../../src/patterns/make-match-function';
import parsePatternSource from '../../src/patterns/parse-pattern-source';
import Pattern from '../../src/patterns/pattern';


// TODO: temp... move this out...
describe('Singleton patterns', () => {
    it('works', () => {
        let p1 = new Pattern('/*/bar/{...baz}');
        let p2 = new Pattern('/{n}/bar/**');
        let p3 = new Pattern('/*/bar/…');
        let p4 = new Pattern('/*/bAr/…');
        let p5 = new Pattern('/*/bar/…');
        expect(p1).not.equals(p2);
        expect(p2).not.equals(p3);
        expect(p3).not.equals(p4);
        expect(p4).not.equals(p5);
        expect(p3).equals(p5); // both same normal pattern

        expect(p1.normalized).equals(p2.normalized);
        expect(p2.normalized).equals(p3.normalized);
        expect(p3.normalized).not.equals(p4.normalized);
        expect(p4.normalized).not.equals(p5.normalized);
        expect(p3.normalized).equals(p5.normalized); // both same normal pattern

        expect(p1).not.equals(p1.normalized);
        expect(p2).not.equals(p2.normalized);
        expect(p3).equals(p3.normalized);
        expect(p4).equals(p4.normalized);
        expect(p5).equals(p5.normalized);
    });
});




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
                let pattern = new Pattern(patternSource);
                actualSignature = pattern.normalized.toString(); // TODO: review this line
                actualCaptureNames = parsePatternSource(patternSource).captures.filter(n => n !== '?'); // TODO: test parsePatternSource separately?
            }
            catch (ex) { }
            expect(actualSignature).equals(expectedSignature);
            expect(actualCaptureNames).to.deep.equal(expectedCaptureNames);
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
            let pattern = new Pattern(patternSource);
            let actualCaptures = pattern.match(address); // TODO: test makeMatchFunction separately?
            expect(actualCaptures).to.deep.equal(expectedCaptures);
            if (!isMatch) return;
            let expectedCaptureNames = Object.keys(expectedCaptures);
            let actualCaptureNames = parsePatternSource(patternSource).captures.filter(n => n !== '?'); // TODO: test parsePatternSource separately?
            expect(actualCaptureNames).to.include.members(expectedCaptureNames);
            expect(expectedCaptureNames).to.include.members(actualCaptureNames);
        });
    });
});
