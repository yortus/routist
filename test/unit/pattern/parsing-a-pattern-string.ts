'use strict';
import {expect} from 'chai';
import {parsePatternSource, PatternAST} from 'routist';


describe('Parsing a pattern string', () => {

    let tests = [
        '∅ ==> {signature: "∅", captures: []}',
        '/api/foo ==> {signature: "/api/foo", captures: []}',
        '/api/foo/BAR ==> {signature: "/api/foo/BAR", captures: []}',
        '/api/foo… ==> {signature: "/api/foo…", captures: ["?"]}',
        '/api/foo... ==> {signature: "/api/foo…", captures: ["?"]}',
        '/api/foo/... ==> {signature: "/api/foo/…", captures: ["?"]}',
        '/api/foo/{...rest} ==> {signature: "/api/foo/…", captures: ["rest"]}',
        '/API/f* ==> {signature: "/API/f*", captures: ["?"]}',
        '/api/{foO}O ==> {signature: "/api/*O", captures: ["foO"]}',
        '/…/{name}.{ext} ==> {signature: "/…/*.*", captures: ["?", "name", "ext"]}',
        '/.../{name}.{ext} ==> {signature: "/…/*.*", captures: ["?", "name", "ext"]}',
        '/{...aPath}/{name}.{ext} ==> {signature: "/…/*.*", captures: ["aPath", "name", "ext"]}',
        '/-/./- ==> {signature: "/-/./-", captures: []}',
        '/foo// ==> {signature: "/foo//", captures: []}',
        '// ==> {signature: "//", captures: []}',
        '{$} ==> {signature: "*", captures: ["$"]}',
        '{...__} ==> {signature: "…", captures: ["__"]}',
        '.... ==> {signature: "….", captures: ["?"]}',
        'GET /foo ==> {signature: "GET /foo", captures: []}',
        '{method} {...path} ==> {signature: "* …", captures: ["method", "path"]}',
        'GET   /foo ==> {signature: "GET   /foo", captures: []}',
        '   GET /foo ==> {signature: "   GET /foo", captures: []}',
        '   /    ==> {signature: "   /", captures: []}',
        '/∅ ==> ERROR',
        '∅… ==> ERROR',
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

    tests.forEach(test => {
        it(test, () => {
            let patternSource = test.split(' ==> ')[0];
            let rhs = test.split(' ==> ')[1];
            let expected: PatternAST|string = rhs === "ERROR" ? rhs : eval(`(${rhs})`);
            let actual: PatternAST|string = 'ERROR';
            try {
                actual = parsePatternSource(patternSource);
            }
            catch (ex) { }
            expect(actual).to.deep.equal(expected);
        });
    });
});
