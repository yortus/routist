'use strict';
var chai_1 = require('chai');
var parse_pattern_source_1 = require('../../src/patterns/parse-pattern-source');
describe('Parsing a pattern string', () => {
    let tests = [
        'T: /api/foo',
        'T: /api/foo/BAR',
        'T: /api/foo…',
        'T: /api/foo**',
        'T: /api/foo/**',
        'T: /api/foo/{...rest}',
        'T: /API/f*',
        'T: /api/{foO}O',
        'T: /…/{name}.{ext}',
        'T: /**/{name}.{ext}',
        'T: /{...aPath}/{name}.{ext}',
        'T: /-/./-',
        'F: /foo//',
        'F: //',
        'F: /***',
        'F: /*…',
        'F: /foo/{...rest}*',
        'F: /foo/{name}{ext}',
        'F: /$foo',
        'F: /bar/?',
        'F: {}',
        'F: {a...}',
        'F: {...}',
        'F: {..}',
        'F: {..a}',
        'F: {foo-bar}',
        'F: {"foo"}',
        'F: {',
        'F: }',
        'F: {{}',
        'F: {}}',
        'T: {$}',
        'T: {...__}'
    ];
    tests.forEach(test => {
        it(test, () => {
            let patternSource = test.slice(3);
            let expected = test[0] === 'T' ? true : false;
            let actual = true;
            try {
                parse_pattern_source_1.default(patternSource);
            }
            catch (ex) {
                actual = false;
            }
            chai_1.expect(actual).equals(expected);
        });
    });
});
//# sourceMappingURL=parse-pattern-source.js.map