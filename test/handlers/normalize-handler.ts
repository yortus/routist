'use strict';
import {expect} from 'chai';
import normalizeHandler from '../../src/handlers/normalize-handler';
import Pattern from '../../src/patterns/pattern';


describe('Normalizing a handler function', () => {

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
            handler: ($req, rest) => `${$req}, ${rest}`,
            tunnel: rq => null,
            response: '[object Object], foo/bar/baz.html'
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
            handler: (path, ext, $req, name) => `${path}, ${ext}, ${$req}, ${name}`,
            tunnel: rq => null,
            response: 'bar, html, [object Object], baz'
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            pathname: '/foo/bar/baz.html',
            handler: (path, ext, req, name) => `${path}, ${ext}, ${req}, ${name}`,
            tunnel: rq => null,
            response: 'ERROR: Unsatisfied parameter...'
        },
        {
            pattern: '/api/{...$req}',
            pathname: '/api/foo/bar/baz.html',
            handler: ($req) => `${$req}`,
            tunnel: rq => null,
            response: 'ERROR: Reserved name...'
        },
        {
            pattern: '/api/{...req}',
            pathname: '/api/foo/bar/baz.html',
            handler: ($req) => `${$req}`,
            tunnel: rq => null,
            response: 'ERROR: Unused captures...'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, $req, $yield) => `${$yield($req)}-${rest.slice(4, 7)}`,
            tunnel: rq => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, $yield) => `${$yield()}-${rest.slice(4, 7)}`, // NB: no rq this time
            tunnel: rq => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handler: (rest, $yield) => $yield() || '!',
            tunnel: rq => null,
            response: '!'
        },
    ];

    tests.forEach((test, i) => {
        it(`${test.pattern} WITH ${test.handler}`, () => {
            let expectedResponse = test.response;
            try {
                let canonicalHandler = normalizeHandler(new Pattern(test.pattern), test.handler);
                let request = { pathname: test.pathname };
                let tunnel = (rq?) => test.tunnel(rq || request);
                let actualResponse = <any> canonicalHandler(request, (rq?) => test.tunnel(rq || request));
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
