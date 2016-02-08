'use strict';
var chai_1 = require('chai');
var is_decorator_1 = require('../../src/routing/is-decorator'); // TODO: test sepatately...
var pattern_1 = require('../../src/patterns/pattern');
var rule_1 = require('../../src/routing/rule');
describe('Constructing a Rule instance', function () {
    var tests = [
        {
            pattern: '/api/{...rest}',
            handler: function (rest) { },
            isDecorator: false,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: function ($req, rest) { },
            isDecorator: false,
            error: null
        },
        {
            pattern: '/api/…',
            handler: function () { },
            isDecorator: false,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: function () { },
            isDecorator: undefined,
            error: "Capture name(s) 'rest' unused by handler..."
        },
        {
            pattern: '/api/…',
            handler: function (rest) { },
            isDecorator: undefined,
            error: "Handler parameter(s) 'rest' not captured by pattern..."
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: function (path, ext, $req, name) { },
            isDecorator: false,
            error: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: function (path, ext, req, name) { },
            isDecorator: undefined,
            error: "Handler parameter(s) 'req' not captured by pattern..."
        },
        {
            pattern: '/api/{...$req}',
            handler: function ($req) { },
            isDecorator: undefined,
            error: "Use of reserved name(s) '$req' as capture(s) in pattern..."
        },
        {
            pattern: '/api/{...req}',
            handler: function ($req) { },
            isDecorator: undefined,
            error: "Capture name(s) 'req' unused by handler..."
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $req, $next) { },
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $next) { },
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest} #2',
            handler: function (rest, $next) { },
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest} #1000',
            handler: function (rest, $next) { },
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest} #comment',
            handler: function (rest, $next) { },
            isDecorator: true,
            error: null
        },
        {
            pattern: '#/api/{...rest}',
            handler: function (rest, $next) { },
            isDecorator: undefined,
            error: "Handler parameter(s) 'rest' not captured by pattern..."
        },
        {
            pattern: '/api/{...rest} # 2 0 abc   ',
            handler: function (rest, $next) { },
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/x # was... /{...rest}',
            handler: function () { },
            isDecorator: false,
            error: null
        },
    ];
    tests.forEach(function (test) {
        it(test.pattern + " WITH " + test.handler, function () {
            var expectedIsDecorator = test.isDecorator;
            var expectedError = test.error || '';
            var actualIsDecorator;
            var actualError = '';
            try {
                var rule = new rule_1.default(new pattern_1.default(test.pattern), test.handler);
                actualIsDecorator = is_decorator_1.default(rule.execute);
            }
            catch (ex) {
                actualError = ex.message;
                if (expectedError.slice(-3) === '...') {
                    actualError = actualError.slice(0, expectedError.length - 3) + '...';
                }
            }
            chai_1.expect(actualIsDecorator).equals(expectedIsDecorator);
            chai_1.expect(actualError).equals(expectedError);
        });
    });
});
describe('Executing a rule against an address', function () {
    var tests = [
        {
            // TODO: doc... `downstream` is only called for decorator rules...
            pattern: '/api/{...rest}',
            handler: function (rest) { return ("" + rest); },
            request: '/api/foo/bar/baz.html',
            downstream: undefined,
            response: 'foo/bar/baz.html'
        },
        {
            pattern: '/api/{...rest}',
            handler: function ($req, rest) { return ($req + ", " + rest); },
            request: '/api/foo/bar/baz.html',
            downstream: undefined,
            response: '/api/foo/bar/baz.html, foo/bar/baz.html'
        },
        {
            pattern: '/api/…',
            handler: function () { return ''; },
            request: '/api/foo/bar/baz.html',
            downstream: undefined,
            response: ''
        },
        {
            pattern: '/api/…',
            handler: function () { return ''; },
            request: '/foo/bar/baz.html',
            downstream: undefined,
            response: null
        },
        {
            pattern: '/api/…',
            handler: function ($next) { return ''; },
            request: '/foo/bar/baz.html',
            downstream: function (rq) { return null; },
            response: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: function (path, ext, $req, name) { return (path + ", " + ext + ", " + $req + ", " + name); },
            request: { address: '/foo/bar/baz.html' },
            downstream: undefined,
            response: 'bar, html, [object Object], baz'
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $req, $next) { return ($next($req) + "-" + rest.slice(4, 7)); },
            request: '/api/foo/bar/baz.html',
            downstream: function (rq) { return ("" + rq.slice(5, 8)); },
            response: 'foo-bar'
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $next) { return ($next() + "-" + rest.slice(4, 7)); },
            request: '/api/foo/bar/baz.html',
            downstream: function (rq) { return ("" + rq.address.slice(5, 8)); },
            response: "ERROR: Cannot read property 'address' of undefined..."
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $next) { return $next() || '!'; },
            request: '/api/foo/bar/baz.html',
            downstream: function (rq) { return null; },
            response: '!'
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $next) { return $next('123') || '!'; },
            request: '/api/foo/bar/baz.html',
            downstream: function (rq) { return ("abc" + rq); },
            response: 'abc123'
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest) { throw new Error('fail!'); },
            request: { address: '/api/foo' },
            downstream: undefined,
            response: 'ERROR: fail!'
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest) { throw new Error('fail!'); },
            request: '/api/foo',
            downstream: undefined,
            response: 'ERROR: fail!'
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $next) { return $next('123') + null['wat']; },
            request: '/api/foo',
            downstream: function (rq) { throw new Error('downfail!'); },
            response: 'ERROR: downfail!'
        },
        {
            pattern: '/api/{...rest}',
            handler: function (rest, $next) { return $next('123') + null['wat']; },
            request: '/api/foo',
            downstream: function (rq) { return rq; },
            response: "ERROR: Cannot read property 'wat' of null"
        }
    ];
    tests.forEach(function (test) {
        it(test.pattern + " WITH " + test.handler, function () {
            var rule = new rule_1.default(new pattern_1.default(test.pattern), test.handler);
            var expectedResponse = test.response;
            var actualResponse;
            try {
                var downstream = test.downstream;
                actualResponse = is_decorator_1.default(rule.execute) ? rule.execute(test.request, downstream) : rule.execute(test.request);
            }
            catch (ex) {
                actualResponse = "ERROR: " + ex.message;
                if (expectedResponse && expectedResponse.slice(-3) === '...') {
                    actualResponse = actualResponse.slice(0, expectedResponse.length - 3) + '...';
                }
            }
            chai_1.expect(actualResponse).equals(expectedResponse);
        });
    });
});
//# sourceMappingURL=rule.js.map