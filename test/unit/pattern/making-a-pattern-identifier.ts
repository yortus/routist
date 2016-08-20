import {expect} from 'chai';
import {Pattern} from 'routist';


describe('Making a pattern identifier', () => {

    let tests = [
        '∅ ==> ℙ',
        '/api/foo ==> ℙﾉapiﾉfoo',
        '/api/foo/BAR ==> ℙﾉapiﾉfooﾉBAR',
        '/api/foo… ==> ℙﾉapiﾉfoo﹍',
        '/api/foo... ==> ℙﾉapiﾉfoo﹍',
        '/api/foo/... ==> ℙﾉapiﾉfooﾉ﹍',
        '/api/foo/{...rest} ==> ℙﾉapiﾉfooﾉ﹍',
        '/API/f* ==> ℙﾉAPIﾉfᕽ',
        '/api/{foO}O ==> ℙﾉapiﾉᕽO',
        '/…/{name}.{ext} ==> ℙﾉ﹍ﾉᕽˌᕽ',
        '/.../{name}.{ext} ==> ℙﾉ﹍ﾉᕽˌᕽ',
        '/{...aPath}/{name}.{ext} ==> ℙﾉ﹍ﾉᕽˌᕽ',
        '/-/./- ==> ℙﾉￚﾉˌﾉￚ',
        '/foo// ==> ℙﾉfooﾉﾉ',
        'GET /foo ==> ℙGETㆍﾉfoo',
        ' GET /foo  ==> ℙㆍGETㆍﾉfoo',
        '// ==> ℙﾉﾉ',
        '{$} ==> ℙᕽ',
        '{…__} ==> ℙ﹍'
    ];

    tests.forEach(test => {
        it(test, () => {
            let patternSource = test.split(' ==> ')[0].replace(/^∅$/, '');
            let expected = test.split(' ==> ')[1].replace(/^∅$/, '');
            let actual = new Pattern(patternSource).toIdentifier();
            expect(actual).to.deep.equal(expected);
        });
    });
});
