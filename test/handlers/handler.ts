'use strict';
import {expect} from 'chai';
import Handler from '../../src/handlers/handler';
import Pattern from '../../src/patterns/pattern';


describe('Constructing a Handler instance', () => {

    let tests = [
        {
            pattern: '/api/{...rest}',
            action: (rest) => {},
            error: null
        },
        {
            pattern: '/api/{...rest}',
            action: ($req, rest) => {},
            error: null
        },
        {
            pattern: '/api/…',
            action: () => {},
            error: null
        },
        {
            pattern: '/api/{...rest}',
            action: () => {},
            error: `Capture name(s) 'rest' unused by handler...`
        },
        {
            pattern: '/api/…',
            action: (rest) => {},
            error: `Handler parameter(s) 'rest' not captured by pattern...`
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            action: (path, ext, $req, name) => {},
            error: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            action: (path, ext, req, name) => {},
            error: `Handler parameter(s) 'req' not captured by pattern...`
        },
        {
            pattern: '/api/{...$req}',
            action: ($req) => {},
            error: `Use of reserved name(s) '$req' as capture(s) in pattern...`
        },
        {
            pattern: '/api/{...req}',
            action: ($req) => {},
            error: `Capture name(s) 'req' unused by handler...`
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $req, $yield) => {},
            error: null
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $yield) => {},
            error: null
        }
    ];

    tests.forEach(test => {
        it(`${test.pattern} WITH ${test.action}`, () => {
            let expectedError = test.error || '';
            let actualError = '';
            try {
                new Handler(new Pattern(test.pattern), test.action);
            }
            catch (ex) {
                actualError = ex.message;
                if (expectedError.slice(-3) === '...') {
                    actualError = actualError.slice(0, expectedError.length - 3) + '...';
                }
            }
            expect(actualError).equals(expectedError);
        });
    });
});


describe('Executing a handler against a pathname', () => {
    let tests = [
        {
            pattern: '/api/{...rest}',
            action: (rest) => `${rest}`,
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: 'foo/bar/baz.html'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => `${rest}`,
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => 'other',
            response: 'other'
        },
        {
            pattern: '/api/{...rest}',
            action: ($req, rest) => `${$req}, ${rest}`,
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: '[object Object], foo/bar/baz.html'
        },
        {
            pattern: '/api/…',
            action: () => '',
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: ''
        },
        {
            pattern: '/api/…',
            action: () => '',
            pathname: '/foo/bar/baz.html',
            downstream: rq => 'other',
            response: null
        },
        {
            pattern: '/api/…',
            action: ($yield) => '',
            pathname: '/foo/bar/baz.html',
            downstream: rq => null,
            response: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            action: (path, ext, $req, name) => `${path}, ${ext}, ${$req}, ${name}`,
            pathname: '/foo/bar/baz.html',
            downstream: rq => null,
            response: 'bar, html, [object Object], baz'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $req, $yield) => `${$yield($req)}-${rest.slice(4, 7)}`,
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $yield) => `${$yield()}-${rest.slice(4, 7)}`, // NB: no rq this time
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => `${rq.pathname.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $yield) => $yield() || '!',
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: '!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $yield) => $yield('123') || '!',
            pathname: '/api/foo/bar/baz.html',
            downstream: rq => `abc${rq}`,
            response: 'abc123'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => { throw new Error('fail!'); },
            pathname: '/api/foo',
            downstream: rq => `${rq.pathname}`,
            response: '/api/foo'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => { throw new Error('fail!'); },
            pathname: '/api/foo',
            downstream: rq => null,
            response: 'ERROR: fail!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => { throw new Error('fail!'); },
            pathname: '/api/foo',
            downstream: rq => { throw new Error('downfail!'); },
            response: 'ERROR: downfail!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $yield) => $yield('123') + null['wat'],
            pathname: '/api/foo',
            downstream: rq => { throw new Error('downfail!'); },
            response: 'ERROR: downfail!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $yield) => $yield('123') + null['wat'],
            pathname: '/api/foo',
            downstream: rq => rq,
            response: `ERROR: Cannot read property 'wat' of null`
        }
    ];

    tests.forEach(test => {
        it(`${test.pattern} WITH ${test.action}`, () => {
            let handler = new Handler(new Pattern(test.pattern), test.action);
            let request = { pathname: test.pathname };
            let downstream = (rq?) => test.downstream(rq || request);
            let expectedResponse = test.response;
            let actualResponse;
            try {
                actualResponse = handler.execute(request, (rq?) => test.downstream(rq || request));
            }
            catch (ex) {
                actualResponse = `ERROR: ${ex.message}`;
                if (expectedResponse && expectedResponse.slice(-3) === '...') {
                    actualResponse = actualResponse.slice(0, expectedResponse.length - 3) + '...';
                }
            }
            expect(actualResponse).equals(expectedResponse);
        });
    });
});
