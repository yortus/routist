//import routist = require('..');
import {expect} from 'chai';


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
            'a* ∩ *a',
            'a/… ∩ …/a',
        ];

        tests.forEach(test => {
            let [a, b] = test.split(' ∩ ');
            let unifications = getUnifications(a, b);
            let result = reduceUnifications(unifications);
            console.log(`${test}   ==>   ${result}`);
        });
    });
});


function reduceUnifications(unifications: string[]): string {
    let isEliminated = unifications.map(u => false);
    for (let i = 0; i < unifications.length; ++i) {
        if (isEliminated[i]) continue;
        let u = unifications[i];
        let re = toRegex(u);
        for (let j = 0; j < unifications.length; ++j) {
            if (i === j) continue;
            if (isEliminated[j]) continue;
            let v = unifications[j];
            isEliminated[j] = re.test(v);
        }
    }

    unifications = unifications.filter((_, i) => !isEliminated[i]);
    let result = unifications.length === 0 ? '∅' : unifications.join(' ∪ ');
    return result;

    function toRegex(s: string) {
        let text = s.split('').map(c => {
            if (c === '*') return '[^\\/]*';
            if (c === '…') return '.*';
            if (['/'].indexOf(c) !== -1) return `\\${c}`;
            return c;
        }).join('');
        return new RegExp(`^${text}$`);
    }
}


function getUnifications(a: string, b: string): string[] {
    if (a === '' || b === '') {
        let ab = a + b;
        return ab === '' || ab === '*' || ab === '…' ? [''] : [];
    }
    else if (a[0] === '…') {
        let result: string[] = [];
        for (let n = 0; n <= b.length; ++n) {
            let bFirst = b.slice(0, n);
            let bTip = b[n - 1];
            let bRest = b.slice(n);
            if (bTip === '…') bRest = bTip + bRest;
            let more = getUnifications(a.slice(1), bRest).map(u => bFirst + u);
            result.push.apply(result, more);
        }
        return result;
    }
    else if (b[0] === '…') {
        return getUnifications(b, a);
    }
    else if (a[0] === '*') {
        let result: string[] = [];
        for (let n = 0; n <= b.length; ++n) {
            let bFirst = b.slice(0, n);
            if (bFirst.indexOf('/') !== -1) break;
            if (a[0] === '*' && bFirst.indexOf('…') !== -1) break;
            let bTip = b[n - 1];
            let bRest = b.slice(n);
            if (bTip === '*') bRest = bTip + bRest;
            let more = getUnifications(a.slice(1), bRest).map(u => bFirst + u);
            result.push.apply(result, more);
        }
        return result;
    }
    else if (b[0] === '*') {
        return getUnifications(b, a);
    }
    else {
        if (a[0] !== b[0]) return [];
        return getUnifications(a.slice(1), b.slice(1)).map(u => a[0] + u);
    }
}
