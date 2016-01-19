'use strict';
import {expect} from 'chai';
import normalizeHandler from '../src/normalize-handler';


describe('normalization of a handler function', () => {

    let tests = [
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest) => `${rest}`,
            innerHandlers: (rq) => null,
            response: 'foo/bar/baz.html'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest) => `${rest}`,
            innerHandlers: (rq) => 'inner',
            response: 'inner'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (req, rq, rest) => `${req}, ${rq}, ${rest}`,
            innerHandlers: (rq) => null,
            response: '[object Object], [object Object], foo/bar/baz.html'
        },
        {
            pattern: '/api/…',
            pathname: '/api/foo/bar/baz.html',
            handler: () => '',
            innerHandlers: (rq) => null,
            response: '',
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: () => '',
            innerHandlers: (rq) => null,
            response: 'ERROR: Unused captures...'
        },
        {
            pattern: '/api/…',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest) => `${rest}`,
            innerHandlers: (rq) => null,
            response: 'ERROR: Unsatisfied parameter...'
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            pathname: '/foo/bar/baz.html',
            handler: (path, ext, request, name) => `${path}, ${ext}, ${request}, ${name}`,
            innerHandlers: (rq) => null,
            response: 'bar, html, [object Object], baz'
        },
        {
            pattern: '/api/{...request}',
            pathname: '/api/foo/bar/baz.html',
            handler: (request) => `${request}`,
            innerHandlers: (rq) => null,
            response: 'ERROR: Reserved name...'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, rq, handle) => `${handle(rq)}-${rest.slice(4, 7)}`,
            innerHandlers: (rq) => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, handle) => `${handle()}-${rest.slice(4, 7)}`, // NB: no rq this time
            innerHandlers: (rq) => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, handle) => handle() || 'outer',
            innerHandlers: (rq) => null,
            response: 'outer'
        },
    ];

    tests.forEach((test, i) => {
        it(`${test.pattern} WITH ${test.handler}`, () => {
            let expectedResponse = test.response;
            try {
                let canonicalHandler = normalizeHandler(test.pattern, test.handler);
                let request = { pathname: test.pathname };
                let actualResponse = <any> canonicalHandler(request, test.innerHandlers);
                expect(actualResponse).equals(expectedResponse);
            }
            catch (ex) {
                let actualResponse = `ERROR: ${ex.message}`;
                if (expectedResponse.slice(-3) === '...') {
                    actualResponse = actualResponse.slice(0, expectedResponse.length - 3) + '...';
                }
                expect(actualResponse).equals(expectedResponse);
            }
        });
    });
});
