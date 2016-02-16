'use strict';
var chai_1 = require('chai');
var parse_pattern_source_1 = require('../../src/pattern/parse-pattern-source');
describe('Parsing a pattern string', function () {
    var tests = [
        '/api/foo ==> {signature: "/api/foo", captures: []}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", captures: []}',
        '/api/foo… ==> {signature: "/api/foo…", captures: ["?"]}',
        '/api/foo** ==> {signature: "/api/foo…", captures: ["?"]}',
        '/api/foo/** ==> {signature: "/api/foo/…", captures: ["?"]}',
        '/api/foo/{...rest} ==> {signature: "/api/foo/…", captures: ["rest"]}',
        '/API/f* ==> {signature: "/API/f*", captures: ["?"]}',
        '/api/{foO}O ==> {signature: "/api/*O", captures: ["foO"]}',
        '/…/{name}.{ext} ==> {signature: "/…/*.*", captures: ["?", "name", "ext"]}',
        '/**/{name}.{ext} ==> {signature: "/…/*.*", captures: ["?", "name", "ext"]}',
        '/{...aPath}/{name}.{ext} ==> {signature: "/…/*.*", captures: ["aPath", "name", "ext"]}',
        '/-/./- ==> {signature: "/-/./-", captures: []}',
        '/foo// ==> {signature: "/foo//", captures: []}',
        '// ==> {signature: "//", captures: []}',
        '{$} ==> {signature: "*", captures: ["$"]}',
        '{...__} ==> {signature: "…", captures: ["__"]}',
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
    ];
    tests.forEach(function (test) {
        it(test, function () {
            var patternSource = test.split(' ==> ')[0];
            var rhs = test.split(' ==> ')[1];
            var expected = rhs === "ERROR" ? rhs : eval("(" + rhs + ")");
            var actual = 'ERROR';
            try {
                actual = parse_pattern_source_1.default(patternSource);
            }
            catch (ex) { }
            chai_1.expect(actual).to.deep.equal(expected);
        });
    });
});
//# sourceMappingURL=parse-pattern-source.js.map