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
            'a* ∩ *a',
            'a/… ∩ …/a',
        ];
        tests.forEach(function (test) {
            var _a = test.split(' ∩ '), a = _a[0], b = _a[1];
            var unifications = getUnifications(a, b);
            var result = reduceUnifications(unifications);
            console.log(test + "   ==>   " + result);
        });
    });
});
function reduceUnifications(unifications) {
    var isEliminated = unifications.map(function (u) { return false; });
    for (var i = 0; i < unifications.length; ++i) {
        if (isEliminated[i])
            continue;
        var u = unifications[i];
        var re = toRegex(u);
        for (var j = 0; j < unifications.length; ++j) {
            if (i === j)
                continue;
            if (isEliminated[j])
                continue;
            var v = unifications[j];
            isEliminated[j] = re.test(v);
        }
    }
    unifications = unifications.filter(function (_, i) { return !isEliminated[i]; });
    var result = unifications.length === 0 ? '∅' : unifications.join(' ∪ ');
    return result;
    function toRegex(s) {
        var text = s.split('').map(function (c) {
            if (c === '*')
                return '[^\\/]*';
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
    else if (a[0] === '…') {
        var result = [];
        for (var n = 0; n <= b.length; ++n) {
            var bFirst = b.slice(0, n);
            var bTip = b[n - 1];
            var bRest = b.slice(n);
            if (bTip === '…')
                bRest = bTip + bRest;
            var more = getUnifications(a.slice(1), bRest).map(function (u) { return bFirst + u; });
            result.push.apply(result, more);
        }
        return result;
    }
    else if (b[0] === '…') {
        return getUnifications(b, a);
    }
    else if (a[0] === '*') {
        var result = [];
        for (var n = 0; n <= b.length; ++n) {
            var bFirst = b.slice(0, n);
            if (bFirst.indexOf('/') !== -1)
                break;
            if (a[0] === '*' && bFirst.indexOf('…') !== -1)
                break;
            var bTip = b[n - 1];
            var bRest = b.slice(n);
            if (bTip === '*')
                bRest = bTip + bRest;
            var more = getUnifications(a.slice(1), bRest).map(function (u) { return bFirst + u; });
            result.push.apply(result, more);
        }
        return result;
    }
    else if (b[0] === '*') {
        return getUnifications(b, a);
    }
    else {
        if (a[0] !== b[0])
            return [];
        return getUnifications(a.slice(1), b.slice(1)).map(function (u) { return a[0] + u; });
    }
}
//# sourceMappingURL=main.js.map