'use strict';
var chai_1 = require('chai');
var normalize_pattern_1 = require('../src/normalize-pattern');
describe('normalization of a pattern string', () => {
    let tests = [
        '/api/foo = /api/foo',
        '/api/foo/bar = /api/foo/bar',
        '/api/foo… = /api/foo…',
        '/api/foo/{...rest} = /api/foo/…',
        '/api/f* = /api/f*',
        '/api/{fo}o = /api/*o',
        '/…/{name}.{ext} = /…/*.*',
        '/{...path}/{name}.{ext} = /…/*.*'
    ];
    tests.forEach(test => {
        it(test, () => {
            let original = test.split(' = ')[0];
            let expectedCanonical = test.split(' = ')[1];
            let actualCanonical = normalize_pattern_1.default(original);
            chai_1.expect(actualCanonical).equals(expectedCanonical);
        });
    });
});
//# sourceMappingURL=normalize-pattern.js.map