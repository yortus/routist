'use strict';
var chai_1 = require('chai');
var pattern_1 = require('../../src/pattern');
describe('Making a pattern identifier', function () {
    var tests = [
        '/api/foo ==> ﾉapiﾉfoo',
        '/api/foo/BAR ==> ﾉapiﾉfooﾉBAR',
        '/api/foo… ==> ﾉapiﾉfoo﹍',
        '/api/foo** ==> ﾉapiﾉfoo﹍',
        '/api/foo/** ==> ﾉapiﾉfooﾉ﹍',
        '/api/foo/{...rest} ==> ﾉapiﾉfooﾉ﹍',
        '/API/f* ==> ﾉAPIﾉfᕽ',
        '/api/{foO}O ==> ﾉapiﾉᕽO',
        '/…/{name}.{ext} ==> ﾉ﹍ﾉᕽˌᕽ',
        '/**/{name}.{ext} ==> ﾉ﹍ﾉᕽˌᕽ',
        '/{...aPath}/{name}.{ext} ==> ﾉ﹍ﾉᕽˌᕽ',
        '/-/./- ==> ﾉーﾉˌﾉー',
        '/foo// ==> ﾉfooﾉﾉ',
        '// ==> ﾉﾉ',
        '{$} ==> ᕽ',
        '{...__} ==> ﹍',
    ];
    tests.forEach(function (test) {
        it(test, function () {
            var patternSource = test.split(' ==> ')[0];
            var expected = test.split(' ==> ')[1];
            var actual = new pattern_1.default(patternSource).toIdentifierParts();
            chai_1.expect(actual).to.deep.equal(expected);
        });
    });
});
//# sourceMappingURL=making-a-pattern-identifier.js.map