'use strict';
var chai_1 = require('chai');
var pattern_1 = require('../../src/pattern');
describe('Constructing a Pattern instance', function () {
    var tests = [
        '/api/foo ==> /api/foo WITH []',
        '/api/foo/BAR ==> /api/foo/BAR WITH []',
        '/api/foo… ==> /api/foo… WITH []',
        '/api/foo** ==> /api/foo… WITH []',
        '/api/foo/** ==> /api/foo/… WITH []',
        '/api/foo/{...rest} ==> /api/foo/… WITH ["rest"]',
        '/API/f*## ==> /API/f* WITH []',
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
    tests.forEach(function (test) {
        it(test, function () {
            var patternSource = test.split(' ==> ')[0];
            var rhs = test.split(' ==> ')[1];
            var expectedSignature = rhs.split(' WITH ')[0];
            var expectedCaptureNames = eval(rhs.split(' WITH ')[1] || '[]');
            var expectedComment = patternSource.split('#')[1] || '';
            var actualSignature = 'ERROR';
            var actualCaptureNames = [];
            var actualComment = '';
            try {
                var pattern = new pattern_1.default(patternSource);
                actualSignature = pattern.normalized.toString();
                actualCaptureNames = pattern.captureNames;
                actualComment = pattern.comment;
            }
            catch (ex) { }
            chai_1.expect(actualSignature).equals(expectedSignature);
            chai_1.expect(actualCaptureNames).to.deep.equal(expectedCaptureNames);
            chai_1.expect(actualComment).equals(expectedComment);
        });
    });
});
describe('Comparing patterns with their normalized forms', function () {
    var patterns = [
        '/*/bar/{...baz}',
        '/*/bar/…',
        '/{n}/bar/**',
        '/{__}/bar/{...baz}'
    ];
    patterns.forEach(function (a1) {
        var p1 = new pattern_1.default(a1);
        it("'" + a1 + "' vs normalised", function () {
            chai_1.expect(a1 === p1.normalized.toString()).equals(p1 === p1.normalized);
        });
        patterns.forEach(function (a2) {
            var p2 = new pattern_1.default(a2);
            it("'" + a1 + "' vs '" + a2 + "'", function () {
                chai_1.expect(p1.normalized).equals(p2.normalized);
            });
        });
    });
});
//# sourceMappingURL=pattern.js.map