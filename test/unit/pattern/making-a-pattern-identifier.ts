'use strict';
import {expect} from 'chai';
import {Pattern} from 'routist';


describe('Making a pattern identifier', () => {

    let tests = [
        '∅ ==> Ø',
        '/api/foo ==> ﾉapiﾉfoo',
        '/api/foo/BAR ==> ﾉapiﾉfooﾉBAR',
        '/api/foo… ==> ﾉapiﾉfoo﹍',
        '/api/foo... ==> ﾉapiﾉfoo﹍',
        '/api/foo/... ==> ﾉapiﾉfooﾉ﹍',
        '/api/foo/{...rest} ==> ﾉapiﾉfooﾉ﹍',
        '/API/f* ==> ﾉAPIﾉfᕽ',
        '/api/{foO}O ==> ﾉapiﾉᕽO',
        '/…/{name}.{ext} ==> ﾉ﹍ﾉᕽˌᕽ',
        '/.../{name}.{ext} ==> ﾉ﹍ﾉᕽˌᕽ',
        '/{...aPath}/{name}.{ext} ==> ﾉ﹍ﾉᕽˌᕽ',
        '/-/./- ==> ﾉーﾉˌﾉー',
        '/foo// ==> ﾉfooﾉﾉ',
        '// ==> ﾉﾉ',
        '{$} ==> ᕽ',
        '{…__} ==> ﹍'
    ];

    tests.forEach(test => {
        it(test, () => {
            let patternSource = test.split(' ==> ')[0];
            let expected = test.split(' ==> ')[1];
            let actual = new Pattern(patternSource).toIdentifierParts();
            expect(actual).to.deep.equal(expected);
        });
    });
});
