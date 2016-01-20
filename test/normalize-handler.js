'use strict';
var chai_1 = require('chai');
var normalize_handler_1 = require('../src/normalize-handler');
describe('Normalizing of a handler function', () => {
    let tests = [
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest) => `${rest}`,
            tunnel: rq => null,
            response: 'foo/bar/baz.html'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest) => `${rest}`,
            tunnel: rq => 'other',
            response: 'other'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (req, rq, rest) => `${req}, ${rq}, ${rest}`,
            tunnel: rq => null,
            response: '[object Object], [object Object], foo/bar/baz.html'
        },
        {
            pattern: '/api/…',
            pathname: '/api/foo/bar/baz.html',
            handler: () => '',
            tunnel: rq => null,
            response: '',
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: () => '',
            tunnel: rq => null,
            response: 'ERROR: Unused captures...'
        },
        {
            pattern: '/api/…',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest) => `${rest}`,
            tunnel: rq => null,
            response: 'ERROR: Unsatisfied parameter...'
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            pathname: '/foo/bar/baz.html',
            handler: (path, ext, request, name) => `${path}, ${ext}, ${request}, ${name}`,
            tunnel: rq => null,
            response: 'bar, html, [object Object], baz'
        },
        {
            pattern: '/api/{...request}',
            pathname: '/api/foo/bar/baz.html',
            handler: (request) => `${request}`,
            tunnel: rq => null,
            response: 'ERROR: Reserved name...'
        },
        {
            pattern: '/api/{...tunnel}',
            pathname: '/api/foo/bar/baz.html',
            handler: (request) => `${request}`,
            tunnel: rq => null,
            response: 'ERROR: Reserved name...'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, rq, tunnel) => `${tunnel(rq)}-${rest.slice(4, 7)}`,
            tunnel: rq => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, tunnel) => `${tunnel()}-${rest.slice(4, 7)}`,
            tunnel: rq => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, tunnel) => tunnel() || '!',
            tunnel: rq => null,
            response: '!'
        },
    ];
    tests.forEach((test, i) => {
        it(`${test.pattern} WITH ${test.handler}`, () => {
            let expectedResponse = test.response;
            try {
                let canonicalHandler = normalize_handler_1.default(test.pattern, test.handler);
                let request = { pathname: test.pathname };
                let tunnel = (rq) => test.tunnel(rq || request);
                let actualResponse = canonicalHandler(request, (rq) => test.tunnel(rq || request));
                chai_1.expect(actualResponse).equals(expectedResponse);
            }
            catch (ex) {
                let actualResponse = `ERROR: ${ex.message}`;
                if (expectedResponse.slice(-3) === '...') {
                    actualResponse = actualResponse.slice(0, expectedResponse.length - 3) + '...';
                }
                chai_1.expect(actualResponse).equals(expectedResponse);
            }
        });
    });
});
//# sourceMappingURL=normalize-handler.js.map