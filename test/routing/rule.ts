'use strict';
import {expect} from 'chai';
import Pattern from '../../src/patterns/pattern';
import Rule from '../../src/routing/rule';


describe('Constructing a Rule instance', () => {

    let tests = [
        {
            pattern: '/api/{...rest}',
            handler: (rest) => {},
            comment: '',
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: ($req, rest) => {},
            comment: '',
            error: null
        },
        {
            pattern: '/api/…',
            handler: () => {},
            comment: '',
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: () => {},
            comment: '',
            error: `Capture name(s) 'rest' unused by handler...`
        },
        {
            pattern: '/api/…',
            handler: (rest) => {},
            comment: '',
            error: `Handler parameter(s) 'rest' not captured by pattern...`
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: (path, ext, $req, name) => {},
            comment: '',
            error: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: (path, ext, req, name) => {},
            comment: '',
            error: `Handler parameter(s) 'req' not captured by pattern...`
        },
        {
            pattern: '/api/{...$req}',
            handler: ($req) => {},
            comment: '',
            error: `Use of reserved name(s) '$req' as capture(s) in pattern...`
        },
        {
            pattern: '/api/{...req}',
            handler: ($req) => {},
            comment: '',
            error: `Capture name(s) 'req' unused by handler...`
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $req, $next) => {},
            comment: '',
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $next) => {},
            comment: '',
            error: null
        },
        {
            pattern: '/api/{...rest} #2',
            handler: (rest, $next) => {},
            comment: '2',
            error: null
        },
        {
            pattern: '/api/{...rest} #1000',
            handler: (rest, $next) => {},
            comment: '1000',
            error: null
        },
        {
            pattern: '/api/{...rest} #comment',
            handler: (rest, $next) => {},
            comment: 'comment',
            error: null
        },
        {
            pattern: '#/api/{...rest}',
            handler: (rest, $next) => {},
            comment: '',
            error: `Handler parameter(s) 'rest' not captured by pattern...`
        },
        {
            pattern: '/api/{...rest} # 2 0 abc   ',
            handler: (rest, $next) => {},
            comment: ' 2 0 abc   ',
            error: null
        },
        {
            pattern: '/api/x # was... /{...rest}',
            handler: () => {},
            comment: ' was... /{...rest}',
            error: null
        },
    ];

    tests.forEach(test => {
        it(`${test.pattern} WITH ${test.handler}`, () => {
            let expectedComment = test.comment;
            let expectedError = test.error || '';
            let actualComment= '';
            let actualError = '';
            try {
                let pattern = new Pattern(test.pattern);
                let rule = new Rule(pattern, test.handler);
                actualComment = pattern.comment;
            }
            catch (ex) {
                actualError = ex.message;
                if (expectedError.slice(-3) === '...') {
                    actualError = actualError.slice(0, expectedError.length - 3) + '...';
                }
            }
            expect(actualComment).equals(expectedComment);
            expect(actualError).equals(expectedError);
        });
    });
});


describe('Executing a rule against an address', () => {
    let tests = [
        {
            pattern: '/api/{...rest}',
            handler: (rest) => `${rest}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: 'foo/bar/baz.html'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest) => `${rest}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => 'other',
            response: 'other'
        },
        {
            pattern: '/api/{...rest}',
            handler: ($req, rest) => `${$req}, ${rest}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: '/api/foo/bar/baz.html, foo/bar/baz.html'
        },
        {
            pattern: '/api/…',
            handler: () => '',
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: ''
        },
        {
            pattern: '/api/…',
            handler: () => '',
            request: '/foo/bar/baz.html',
            downstream: rq => 'other',
            response: null
        },
        {
            pattern: '/api/…',
            handler: ($next) => '',
            request: '/foo/bar/baz.html',
            downstream: rq => null,
            response: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: (path, ext, $req, name) => `${path}, ${ext}, ${$req}, ${name}`,
            request: { address: '/foo/bar/baz.html' },
            downstream: rq => null,
            response: 'bar, html, [object Object], baz'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $req, $next) => `${$next($req)}-${rest.slice(4, 7)}`,
            request: '/api/foo/bar/baz.html',
            downstream: rq => `${rq.slice(5, 8)}`,
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $next) => `${$next()}-${rest.slice(4, 7)}`, // NB: no rq this time
            request: '/api/foo/bar/baz.html',
            downstream: rq => `${rq.address.slice(5, 8)}`,
            response: `ERROR: Cannot read property 'address' of undefined...`
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $next) => $next() || '!',
            request: '/api/foo/bar/baz.html',
            downstream: rq => null,
            response: '!'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $next) => $next('123') || '!',
            request: '/api/foo/bar/baz.html',
            downstream: rq => `abc${rq}`,
            response: 'abc123'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest) => { throw new Error('fail!'); },
            request: { address: '/api/foo' },
            downstream: rq => `${rq.address}`,
            response: '/api/foo'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest) => { throw new Error('fail!'); },
            request: '/api/foo',
            downstream: rq => null,
            response: 'ERROR: fail!'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest) => { throw new Error('fail!'); },
            request: '/api/foo',
            downstream: rq => { throw new Error('downfail!'); },
            response: 'ERROR: downfail!'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $next) => $next('123') + null['wat'],
            request: '/api/foo',
            downstream: rq => { throw new Error('downfail!'); },
            response: 'ERROR: downfail!'
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $next) => $next('123') + null['wat'],
            request: '/api/foo',
            downstream: rq => rq,
            response: `ERROR: Cannot read property 'wat' of null`
        }
    ];

    tests.forEach(test => {
        it(`${test.pattern} WITH ${test.handler}`, () => {
            let rule = new Rule(new Pattern(test.pattern), test.handler);
            let expectedResponse = test.response;
            let actualResponse;
            try {
                let downstream = test.downstream;
                actualResponse = rule.execute(test.request, downstream);
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
