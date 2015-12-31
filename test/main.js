describe('it', function () {
    // it('works', done => {
    //     routist.main().then(result => {
    //         console.log(result);
    //         done()
    //     });        
    // });
    it('works', function () {
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
        tests.forEach(function (test) {
            var _a = test.split(' ∩ '), a = _a[0], b = _a[1];
            var unifications = getUnifications(a, b);
            var result = reduceUnifications(unifications);
            if (a.indexOf('*…') !== -1 || a.indexOf('…*') !== -1 || b.indexOf('*…') !== -1 || b.indexOf('…*') !== -1)
                result = 'INVALID';
            console.log(test + "   ==>   " + result);
        });
    });
});
function reduceUnifications(unifications) {
    var isEliminated = unifications.map(function (u) { return false; });
    for (var i = 0; i < unifications.length; ++i) {
        if (isEliminated[i])
            continue;
        var re = toRegex(unifications[i]);
        for (var j = 0; j < unifications.length; ++j) {
            if (i === j || isEliminated[j])
                continue;
            isEliminated[j] = re.test(unifications[j]);
        }
    }
    unifications = unifications.filter(function (_, i) { return !isEliminated[i]; });
    var result = unifications.length === 0 ? '∅' : unifications.join(' ∪ ');
    return result;
    function toRegex(s) {
        var text = s.split('').map(function (c) {
            if (c === '*')
                return '[^\\/…]*';
            if (c === '…')
                return '.*';
            if (['/'].indexOf(c) !== -1)
                return "\\" + c;
            return c;
        }).join('');
        return new RegExp("^" + text + "$");
    }
}
function getUnifications(a, b) {
    if (a === '' || b === '') {
        var ab = a + b;
        return ab === '' || ab === '*' || ab === '…' ? [''] : [];
    }
    else if (a[0] === '…' || (a[0] === '*' && b[0] !== '…')) {
        var result = [];
        for (var bSplitIndex = 0; bSplitIndex <= b.length; ++bSplitIndex) {
            var bTip = b[bSplitIndex - 1];
            if (bTip === '…' || bTip === '*')
                continue;
            var bLeftPart = b.slice(0, bSplitIndex);
            if (a[0] === '*' && bLeftPart.indexOf('/') !== -1)
                break;
            if (a[0] === '*' && bLeftPart.indexOf('…') !== -1)
                break;
            var bRightPart = b.slice(bSplitIndex);
            bTip = bRightPart[0];
            if (bTip === '…' || bTip === '*')
                bLeftPart += bTip;
            var more = getUnifications(a.slice(1), bRightPart).map(function (u) { return bLeftPart + u; });
            result.push.apply(result, more);
        }
        return result;
    }
    else if (b[0] === '…' || b[0] === '*') {
        return getUnifications(b, a);
    }
    else if (a[0] === b[0]) {
        return getUnifications(a.slice(1), b.slice(1)).map(function (u) { return a[0] + u; });
    }
    else {
        return [];
    }
}
//# sourceMappingURL=main.js.map