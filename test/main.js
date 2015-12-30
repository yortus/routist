describe('it', function () {
    // it('works', done => {
    //     routist.main().then(result => {
    //         console.log(result);
    //         done()
    //     });        
    // });
    it('works', function () {
        var tests = [
            'ab* ∩ *b',
            'f*o*o*z ∩ foo*baz',
            'f*o*o*baz ∩ foo*z',
            'ab*b ∩ a*bc',
            'ab*b ∩ a*bc*',
            'a*b ∩ ab*ab',
            'a*b ∩ ba*ab',
            '*m*n* ∩ *n*m*',
            '*m*n* ∩ *n*m*n*',
            ' ∩ ',
            ' ∩ *',
            '* ∩ *',
            '* ∩ ',
            'f ∩ ',
            ' ∩ f'
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
        var reText = u.split('').map(function (c) { return c === '*' ? '.*' : (((c))); }).join('');
        var re = new RegExp("^" + reText + "$");
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
    var result = unifications.length === 1 ? unifications[0] : '∅';
    return result;
}
function getUnifications(a, b) {
    if (a === '' || b === '') {
        var ab = a + b;
        return ab === '' || ab === '*' ? [''] : [];
    }
    else if (a[0] === '*') {
        var result = [];
        for (var n = 0; n <= b.length; ++n) {
            var bFirst = b.slice(0, n);
            var bRest = (b[n - 1] === '*' ? '*' : '') + b.slice(n);
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