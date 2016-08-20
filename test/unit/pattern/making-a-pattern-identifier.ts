import {expect} from 'chai';
import {Pattern} from 'routist';


describe('Making a pattern identifier', () => {

    let tests = [
        '∅ ==> ∅',
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
        '/-/./- ==> ﾉￚﾉˌﾉￚ',
        '/foo// ==> ﾉfooﾉﾉ',
        'GET /foo ==> GETㆍﾉfoo',
        ' GET /foo  ==> ㆍGETㆍﾉfoo',
        '// ==> ﾉﾉ',
        '{$} ==> ᕽ',
        '{…__} ==> ﹍'
    ];

    tests.forEach(test => {
        it(test, () => {
            let patternSource = test.split(' ==> ')[0].replace(/^∅$/, '');
            let expected = test.split(' ==> ')[1].replace(/^∅$/, '');
            let actual = new Pattern(patternSource).toIdentifierParts();
            expect(actual).to.deep.equal(expected);
        });
    });
});
