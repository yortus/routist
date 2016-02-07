'use strict';
import {expect} from 'chai';
import parsePatternSource from '../../src/patterns/parse-pattern-source';


describe('Parsing a pattern string', () => {

    let tests = [
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

    tests.forEach(test => {
        it(test, () => {
            let patternSource = test.split(' ==> ')[0];
            let rhs = test.split(' ==> ')[1];
            let expected = rhs === "ERROR" ? rhs : eval(`(${rhs})`);
            let actual: any = 'ERROR';
            try {
                actual = parsePatternSource(patternSource);
            }
            catch (ex) { }
            expect(actual).to.deep.equal(expected);
        });
    });
});
