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
            '*m*n* ∩ *n*m*',
            '*m*n* ∩ *n*m*n*'
        ];
        tests.forEach(function (test) {
            var _a = test.split(' ∩ '), a = _a[0], b = _a[1];
            var unifications = getUnifications(a, b);
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
            console.log(test + "   ==>   " + result);
        });
    });
});
function getUnifications(a, b) {
    var EMPTY = [];
    var aHead = a.charAt(0);
    var bHead = b.charAt(0);
    var aTail = a.slice(1);
    var bTail = b.slice(1);
    if (aHead === '') {
        if (bHead === '') {
            return [''];
        }
        else if (bHead === '*') {
            return bTail ? EMPTY : [''];
        }
        else {
            return EMPTY;
        }
    }
    else if (aHead === '*') {
        if (bHead === '') {
            return aTail ? [] : [''];
        }
        else {
            var result = [];
            for (var n = 0; n <= b.length; ++n) {
                var bh = b.slice(0, n), bt = b.slice(n);
                if (bh.slice(-1) === '*')
                    bt = '*' + bt;
                var more = getUnifications(aTail, bt).map(function (u) { return bh + u; });
                result.push.apply(result, more);
            }
            return result;
        }
    }
    else {
        if (bHead === '') {
            return EMPTY;
        }
        else if (bHead === '*') {
            return getUnifications(b, a);
        }
        else {
            if (aHead !== bHead)
                return EMPTY;
            return getUnifications(aTail, bTail).map(function (u) { return aHead + u; });
        }
    }
}
//# sourceMappingURL=main.js.map