// TODO: Rule got removed... use these tests for Handler instead?





// 'use strict';
// import {expect} from 'chai';
// import isDecorator from '../../src/routing/is-decorator'; // TODO: test sepatately...
// import Pattern from '../../src/pattern';
// import Rule from '../../src/routing/rule';
// 
// 
// describe('Constructing a Rule instance', () => {
// 
//     let tests = [
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest) => {},
//             isDecorator: false,
//             error: null
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: ($req, rest) => {},
//             isDecorator: false,
//             error: null
//         },
//         {
//             pattern: '/api/…',
//             handler: () => {},
//             isDecorator: false,
//             error: null
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: () => {},
//             isDecorator: undefined,
//             error: `Capture name(s) 'rest' unused by handler...`
//         },
//         {
//             pattern: '/api/…',
//             handler: (rest) => {},
//             isDecorator: undefined,
//             error: `Handler parameter(s) 'rest' not captured by pattern...`
//         },
//         {
//             pattern: '/foo/{...path}/{name}.{ext}',
//             handler: (path, ext, $req, name) => {},
//             isDecorator: false,
//             error: null
//         },
//         {
//             pattern: '/foo/{...path}/{name}.{ext}',
//             handler: (path, ext, req, name) => {},
//             isDecorator: undefined,
//             error: `Handler parameter(s) 'req' not captured by pattern...`
//         },
//         {
//             pattern: '/api/{...$req}',
//             handler: ($req) => {},
//             isDecorator: undefined,
//             error: `Use of reserved name(s) '$req' as capture(s) in pattern...`
//         },
//         {
//             pattern: '/api/{...req}',
//             handler: ($req) => {},
//             isDecorator: undefined,
//             error: `Capture name(s) 'req' unused by handler...`
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $req, $next) => {},
//             isDecorator: true,
//             error: null
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $next) => {},
//             isDecorator: true,
//             error: null
//         },
//         {
//             pattern: '/api/{...rest} #2',
//             handler: (rest, $next) => {},
//             isDecorator: true,
//             error: null
//         },
//         {
//             pattern: '/api/{...rest} #1000',
//             handler: (rest, $next) => {},
//             isDecorator: true,
//             error: null
//         },
//         {
//             pattern: '/api/{...rest} #comment',
//             handler: (rest, $next) => {},
//             isDecorator: true,
//             error: null
//         },
//         {
//             pattern: '#/api/{...rest}',
//             handler: (rest, $next) => {},
//             isDecorator: undefined,
//             error: `Handler parameter(s) 'rest' not captured by pattern...`
//         },
//         {
//             pattern: '/api/{...rest} # 2 0 abc   ',
//             handler: (rest, $next) => {},
//             isDecorator: true,
//             error: null
//         },
//         {
//             pattern: '/api/x # was... /{...rest}',
//             handler: () => {},
//             isDecorator: false,
//             error: null
//         },
//     ];
// 
//     tests.forEach(test => {
//         it(`${test.pattern} WITH ${test.handler}`, () => {
//             let expectedIsDecorator = test.isDecorator;
//             let expectedError = test.error || '';
//             let actualIsDecorator: boolean;
//             let actualError = '';
//             try {
//                 let rule = new Rule(new Pattern(test.pattern), test.handler);
//                 actualIsDecorator = isDecorator(rule.execute);
//             }
//             catch (ex) {
//                 actualError = ex.message;
//                 if (expectedError.slice(-3) === '...') {
//                     actualError = actualError.slice(0, expectedError.length - 3) + '...';
//                 }
//             }
//             expect(actualIsDecorator).equals(expectedIsDecorator);
//             expect(actualError).equals(expectedError);
//         });
//     });
// });
// 
// 
// describe('Executing a rule against an address', () => {
//     let tests = [
//         {
//             // TODO: doc... `downstream` is only called for decorator rules...
//             pattern: '/api/{...rest}',
//             handler: (rest) => `${rest}`,
//             request: '/api/foo/bar/baz.html',
//             downstream: undefined,
//             response: 'foo/bar/baz.html'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: ($req, rest) => `${$req}, ${rest}`,
//             request: '/api/foo/bar/baz.html',
//             downstream: undefined,
//             response: '/api/foo/bar/baz.html, foo/bar/baz.html'
//         },
//         {
//             pattern: '/api/…',
//             handler: () => '',
//             request: '/api/foo/bar/baz.html',
//             downstream: undefined,
//             response: ''
//         },
//         {
//             pattern: '/api/…',
//             handler: () => '',
//             request: '/foo/bar/baz.html',
//             downstream: undefined,
//             response: null
//         },
//         {
//             pattern: '/api/…',
//             handler: ($next) => '',
//             request: '/foo/bar/baz.html',
//             downstream: rq => null,
//             response: null
//         },
//         {
//             pattern: '/foo/{...path}/{name}.{ext}',
//             handler: (path, ext, $req, name) => `${path}, ${ext}, ${$req}, ${name}`,
//             request: { address: '/foo/bar/baz.html' },
//             downstream: undefined,
//             response: 'bar, html, [object Object], baz'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $req, $next) => `${$next($req)}-${rest.slice(4, 7)}`,
//             request: '/api/foo/bar/baz.html',
//             downstream: rq => `${rq.slice(5, 8)}`,
//             response: 'foo-bar'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $next) => `${$next()}-${rest.slice(4, 7)}`, // NB: no rq this time
//             request: '/api/foo/bar/baz.html',
//             downstream: rq => `${rq.address.slice(5, 8)}`,
//             response: `ERROR: Cannot read property 'address' of undefined...`
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $next) => $next() || '!',
//             request: '/api/foo/bar/baz.html',
//             downstream: rq => null,
//             response: '!'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $next) => $next('123') || '!',
//             request: '/api/foo/bar/baz.html',
//             downstream: rq => `abc${rq}`,
//             response: 'abc123'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest) => { throw new Error('fail!'); },
//             request: { address: '/api/foo' },
//             downstream: undefined,
//             response: 'ERROR: fail!'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest) => { throw new Error('fail!'); },
//             request: '/api/foo',
//             downstream: undefined,
//             response: 'ERROR: fail!'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $next) => $next('123') + null['wat'],
//             request: '/api/foo',
//             downstream: rq => { throw new Error('downfail!'); },
//             response: 'ERROR: downfail!'
//         },
//         {
//             pattern: '/api/{...rest}',
//             handler: (rest, $next) => $next('123') + null['wat'],
//             request: '/api/foo',
//             downstream: rq => rq,
//             response: `ERROR: Cannot read property 'wat' of null`
//         }
//     ];
// 
//     tests.forEach(test => {
//         it(`${test.pattern} WITH ${test.handler}`, () => {
//             let rule = new Rule(new Pattern(test.pattern), test.handler);
//             let expectedResponse = test.response;
//             let actualResponse;
//             try {
//                 let downstream = test.downstream;
//                 actualResponse = isDecorator(rule.execute) ? rule.execute(test.request, downstream) : rule.execute(test.request);
//             }
//             catch (ex) {
//                 actualResponse = `ERROR: ${ex.message}`;
//                 if (expectedResponse && expectedResponse.slice(-3) === '...') {
//                     actualResponse = actualResponse.slice(0, expectedResponse.length - 3) + '...';
//                 }
//             }
//             expect(actualResponse).equals(expectedResponse);
//         });
//     });
// });
