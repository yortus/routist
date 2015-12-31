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
            '*… ∩ …*', // TODO: <==== BUG result is '*…'. Should disallow adjacent * and …
            'a… ∩ …a',
            '*a… ∩ …a*', // TODO: <==== BUG result is *a* ∪ *a*a… ∪ *a…a* (how got *a*a… ??)
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
            let [a, b] = test.split(' ∩ ');
            let unifications = getUnifications(a, b);
            let result = reduceUnifications(unifications);
            if (a.indexOf('*…') !== -1 || a.indexOf('…*') !== -1 || b.indexOf('*…') !== -1 || b.indexOf('…*') !== -1) result = 'INVALID';
            console.log(`${test}   ==>   ${result}`);
        });
    });
});


function reduceUnifications(unifications: string[]): string {
    let isEliminated = unifications.map(u => false);
    for (let i = 0; i < unifications.length; ++i) {
        if (isEliminated[i]) continue;
        let re = toRegex(unifications[i]);
        for (let j = 0; j < unifications.length; ++j) {
            if (i === j || isEliminated[j]) continue;
            isEliminated[j] = re.test(unifications[j]);
        }
    }

    unifications = unifications.filter((_, i) => !isEliminated[i]);
    let result = unifications.length === 0 ? '∅' : unifications.join(' ∪ ');
    return result;

    function toRegex(s: string) {
        let text = s.split('').map(c => {
            if (c === '*') return '[^\\/…]*';
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
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {
        let result: string[] = [];
        for (let bSplitIndex = 0; bSplitIndex <= b.length; ++bSplitIndex) {

            let bTip = b[bSplitIndex - 1];
            if (bTip === '…' || bTip === '*') continue;

            let bLeftPart = b.slice(0, bSplitIndex);
            if (a[0] === '*' && bLeftPart.indexOf('/') !== -1) break;
            if (a[0] === '*' && bLeftPart.indexOf('…') !== -1) break;
            let bRightPart = b.slice(bSplitIndex);

            bTip = bRightPart[0];
            if (bTip === '…' || bTip === '*') bLeftPart += bTip;

            let more = getUnifications(a.slice(1), bRightPart).map(u => bLeftPart + u);
            result.push.apply(result, more);
        }
        return result;
    }
    else if (b[0] === '…' || b[0] === '*') {
         return getUnifications(b, a);
    }
    else if (a[0] === b[0]) {
        return getUnifications(a.slice(1), b.slice(1)).map(u => a[0] + u);
    }
    else {
        return [];
    }
}
