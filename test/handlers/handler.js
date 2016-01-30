'use strict';
var chai_1 = require('chai');
var handler_1 = require('../../src/handlers/handler');
var pattern_1 = require('../../src/patterns/pattern');
describe('Constructing a Handler instance', () => {
    let tests = [
        {
            pattern: '/api/{...rest}',
            action: (rest) => { },
            priority: 0,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            action: ($req, rest) => { },
            priority: 0,
            error: null
        },
        {
            pattern: '/api/…',
            action: () => { },
            priority: 0,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            action: () => { },
            priority: 0,
            error: `Capture name(s) 'rest' unused by handler...`
        },
        {
            pattern: '/api/…',
            action: (rest) => { },
            priority: 0,
            error: `Handler parameter(s) 'rest' not captured by pattern...`
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            action: (path, ext, $req, name) => { },
            priority: 0,
            error: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            action: (path, ext, req, name) => { },
            priority: 0,
            error: `Handler parameter(s) 'req' not captured by pattern...`
        },
        {
            pattern: '/api/{...$req}',
            action: ($req) => { },
            priority: 0,
            error: `Use of reserved name(s) '$req' as capture(s) in pattern...`
        },
        {
            pattern: '/api/{...req}',
            action: ($req) => { },
            priority: 0,
            error: `Capture name(s) 'req' unused by handler...`
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $req, $next) => { },
            priority: 0,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $next) => { },
            priority: 0,
            error: null
        },
        {
            pattern: '/api/{...rest} #2',
            action: (rest, $next) => { },
            priority: 2,
            error: null
        },
        {
            pattern: '/api/{...rest} #1000',
            action: (rest, $next) => { },
            priority: 1000,
            error: null
        },
        {
            pattern: '/api/{...rest} #comment',
            action: (rest, $next) => { },
            priority: 0,
            error: null
        },
        {
            pattern: '#/api/{...rest}',
            action: (rest, $next) => { },
            priority: 0,
            error: `Handler parameter(s) 'rest' not captured by pattern...`
        },
        {
            pattern: '/api/{...rest} # 2 0 abc',
            action: (rest, $next) => { },
            priority: 2,
            error: null
        },
        {
            pattern: '/api/x # was... /{...rest}',
            action: () => { },
            priority: 0,
            error: null
        },
    ];
    tests.forEach(test => {
        it(`${test.pattern} WITH ${test.action}`, () => {
            let expectedPriority = test.priority || 0;
            let expectedError = test.error || '';
            let actualPriority = 0;
            let actualError = '';
            try {
                let h = new handler_1.default(new pattern_1.default(test.pattern), test.action);
                actualPriority = h.priority;
            }
            catch (ex) {
                actualError = ex.message;
                if (expectedError.slice(-3) === '...') {
                    actualError = actualError.slice(0, expectedError.length - 3) + '...';
                }
            }
            chai_1.expect(actualPriority).equals(expectedPriority);
            chai_1.expect(actualError).equals(expectedError);
        });
    });
});
describe('Executing a handler against a pathname', () => {
    let tests = [
        {
            pattern: '/api/{...rest}',
            action: (rest) => `${rest}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: 'foo/bar/baz.html'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => `${rest}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => 'other',
            response: 'other'
        },
        {
            pattern: '/api/{...rest}',
            action: ($req, rest) => `${$req}, ${rest}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: '/api/foo/bar/baz.html, foo/bar/baz.html'
        },
        {
            pattern: '/api/…',
            action: () => '',
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: ''
        },
        {
            pattern: '/api/…',
            action: () => '',
            request: '/foo/bar/baz.html',
            downstream: rq => 'other',
            response: null
        },
        {
            pattern: '/api/…',
            action: ($next) => '',
            request: '/foo/bar/baz.html',
            downstream: rq => null,
            response: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            action: (path, ext, $req, name) => `${path}, ${ext}, ${$req}, ${name}`,
            request: { pathname: '/foo/bar/baz.html' },
            downstream: rq => null,
            response: 'bar, html, [object Object], baz'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $req, $next) => `${$next.execute($req)}-${rest.slice(4, 7)}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => `${rq.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $next) => `${$next.execute()}-${rest.slice(4, 7)}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => `${rq.pathname.slice(5, 8)}`,
            response: `ERROR: Cannot read property 'pathname' of undefined...`
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $next) => $next.execute() || '!',
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: '!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $next) => $next.execute('123') || '!',
            request: '/api/foo/bar/baz.html',
            downstream: rq => `abc${rq}`,
            response: 'abc123'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => { throw new Error('fail!'); },
            request: { pathname: '/api/foo' },
            downstream: rq => `${rq.pathname}`,
            response: '/api/foo'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => { throw new Error('fail!'); },
            request: '/api/foo',
            downstream: rq => null,
            response: 'ERROR: fail!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest) => { throw new Error('fail!'); },
            request: '/api/foo',
            downstream: rq => { throw new Error('downfail!'); },
            response: 'ERROR: downfail!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $next) => $next.execute('123') + null['wat'],
            request: '/api/foo',
            downstream: rq => { throw new Error('downfail!'); },
            response: 'ERROR: downfail!'
        },
        {
            pattern: '/api/{...rest}',
            action: (rest, $next) => $next.execute('123') + null['wat'],
            request: '/api/foo',
            downstream: rq => rq,
            response: `ERROR: Cannot read property 'wat' of null`
        }
    ];
    tests.forEach(test => {
        it(`${test.pattern} WITH ${test.action}`, () => {
            let handler = new handler_1.default(new pattern_1.default(test.pattern), test.action);
            let expectedResponse = test.response;
            let actualResponse;
            try {
                let downstream = {
                    execute: test.downstream,
                    candidates: { length: 1 }
                };
                actualResponse = handler.execute(test.request, downstream);
            }
            catch (ex) {
                actualResponse = `ERROR: ${ex.message}`;
                if (expectedResponse && expectedResponse.slice(-3) === '...') {
                    actualResponse = actualResponse.slice(0, expectedResponse.length - 3) + '...';
                }
            }
            chai_1.expect(actualResponse).equals(expectedResponse);
        });
    });
});
//# sourceMappingURL=handler.js.map