'use strict';
var RoutePattern = require('../src/route-pattern');
describe('it', () => {
    // it('works', done => {
    //     routist.main().then(result => {
    //         console.log(result);
    //         done()
    //     });        
    // });
    it('works', () => {
        var tests = [
            '/ab* ∩ /*b',
            '/f*o*o*z ∩ /foo*baz',
            '/*/f*o*o*baz ∩ /aaa/foo*z',
            '/ab*b ∩ /a*bc',
            '/ab*b ∩ /a*bc*',
            '/a*b ∩ /ab*ab',
            '/a*b ∩ /ba*ab',
            '/*m*n* ∩ /*n*m*',
            '/*m*n* ∩ /*n*m*n*',
            '/ ∩ /',
            '/ ∩ /*',
            '/* ∩ /*',
            '/* ∩ /',
            '/f ∩ /',
            '/ ∩ /f',
            '/a/b ∩ /*',
            '/a/b ∩ /*/*c*',
            '/a/*b ∩ /*/*c*',
            '/a/*b ∩ /*/*c*/*',
            '/foo/* ∩ /*/bar',
            '/a/b ∩ /…',
            '/a/b ∩ …',
            '/ ∩ …',
            ' ∩ …',
            '….html ∩ …',
            '/foo/….html ∩ …',
            '/foo/….html ∩ /foo/bar/*z/*',
            '/foo/….html ∩ /foo/bar/*z/…',
            '/* ∩ /…',
            '/*/* ∩ /…',
            '/… ∩ /…',
            '/… ∩ /*/*',
            '/…/* ∩ /…',
            '/*/… ∩ /…',
            '/… ∩ /…/*',
            '/… ∩ /*/…',
            '/*/…/* ∩ /…',
            '*/… ∩ …/*',
            '*… ∩ …*',
            'a… ∩ …a',
            '*a… ∩ …a*',
            '…a* ∩ *a…',
            '…a* ∩ *z…',
            '*z… ∩ …a*',
            '*z* ∩ *a*',
            'a*… ∩ …*a',
            'a…* ∩ *…a',
            'a* ∩ *a',
            'a/… ∩ …/a',
        ];
        tests.forEach(test => {
            let pair = test.split(' ∩ ');
            try {
                let a = new RoutePattern(pair[0]);
                let b = new RoutePattern(pair[1]);
                let result = a.intersectWith(b);
                // let all = getAllIntersections(a, b);
                // let distinct = getDistinctPatterns(all);
                // let result = distinct.length === 0 ? '∅' : distinct.join(' ∪ ');
                // if (a.indexOf('*…') !== -1 || a.indexOf('…*') !== -1 || b.indexOf('*…') !== -1 || b.indexOf('…*') !== -1) distinct = 'INVALID';
                console.log(`${test}   ==>   ${result}`);
            }
            catch (ex) {
                console.log(`${test}   ==>   ERROR`);
            }
        });
    });
});
//# sourceMappingURL=main.js.map