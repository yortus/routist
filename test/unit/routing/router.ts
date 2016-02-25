// 'use strict';
// import {expect} from 'chai';
// import compileRuleSet from '../../../src/routing/compile-rule-set';
// 
// 
// // TODO: More coverage:
// // - multiple non-decorator handlers for same pattern
// // - multiple decorator handlers for same pattern
// // - one decorator and some non-decorators for same pattern
// // - decorators along ambiguous paths (same decorators on all paths)
// // - decorators along ambiguous paths (not same decorators on all paths)
// 
// 
// describe('Constructing a Router instance', () => {
// 
//     let ruleSet: {[pattern: string]: Function} = {
//         //'...': () => null, // no-op catch-all rule (this would be implicitly present even if not listed here)
//         '/foo': () => 'foo',
//         '/bar': () => 'bar',
//         '/baz': () => 'baz',
//         '/*a*': ($next) => `---${$next() || 'NONE'}---`,
// 
//         'a/*': () => `starts with 'a'`,
//         '*/b': () => `ends with 'b'`,
//         'a/b': () => `starts with 'a' AND ends with 'b'`,
// 
//         'c/*': () => `starts with 'c'`,
//         '*/d': () => `ends with 'd'`,
//         'c/d': () => null,
// 
//         'api/... #a': () => `fallback`,
//         'api/... #b': () => `fallback`, // TODO: temp testing, remove this...
//         'api/fo*o': () => null,
//         'api/fo* #2': ($req, $next) => `fo2-(${$next($req) || 'NONE'})`,
//         'api/fo* #1': ($req, $next) => `fo1-(${$next($req) || 'NONE'})`,
//         'api/foo ': ($req, $next) => `${$next($req) || 'NONE'}!`,
//         'api/foo': () => 'FOO',
//         'api/foot': () => 'FOOt',
//         'api/fooo': () => 'fooo',
//         'api/bar': () => null,
// 
//         'zzz/{...rest}': ($next, rest) => `${$next({address: rest.split('').reverse().join('')}) || 'NONE'}`,
//         'zzz/b*z': ($req) => `${$req.address}`,
//         'zzz/./*': () => 'forty-two'
//     };
// 
//     // TODO: use or remove...
// //     let testTable23 = {
// //         '/... #latency':                 ($next) => null,
// //         '/... #addBlahHeader':           ($next) => null,
// //         '/... #authorize':               ($next) => null,
// //         '/api/{...path}':               (path) => null,
// //         '/public/main.js':              ($next) => null,
// //         '/public/main.js #1.jquery':    () => null,
// //         '/public/main.js #2.cajon':     () => null,
// //     };
// // 
// //     function compare(pat1, pat2) {
// //         
// //     }
// //     let priorities = [
// //         // Root-level decorators:
// //         'latency', 'authorize', 'addBlahHeader'
// //     ];
// 
// 
//     let tests = [
//         `/foo ==> foo`,
//         `/bar ==> ---bar---`,
//         `/baz ==> ---baz---`,
//         `/quux ==> UNHANDLED`,
//         `/qaax ==> ---NONE---`,
//         `/a ==> ---NONE---`,
//         `/ ==> UNHANDLED`,
// 
//         `a/foo ==> starts with 'a'`,
//         `foo/b ==> ends with 'b'`,
//         `a/b ==> starts with 'a' AND ends with 'b'`,
// 
//         `c/foo ==> starts with 'c'`,
//         `foo/d ==> ends with 'd'`,
//         `c/d ==> ERROR: Multiple possible fallbacks...`,
// 
//         `api/ ==> fallback`,
//         `api/foo ==> fo2-(fo1-(FOO!))`,
//         `api/fooo ==> fo2-(fo1-(fooo))`,
//         `api/foooo ==> fo2-(fo1-(NONE))`,
//         `api/foooot ==> fo2-(fo1-(NONE))`,
//         `api/foot ==> fo2-(fo1-(FOOt))`,
//         `api/bar ==> fallback`,
// 
//         `zzz/baz ==> zab`,
//         `zzz/booz ==> zoob`,
//         `zzz/looz ==> NONE`,
//         `zzz/./{whatever} ==> forty-two`
//     ];
// 
//     let ruleSetHandler = compileRuleSet(ruleSet);
// 
//     tests.forEach(test => it(test, () => {
//         let address = test.split(' ==> ')[0];
//         let request = {address};
//         let expected = test.split(' ==> ')[1];
//         if (expected === 'UNHANDLED') expected = null;
//         let actual: string;
//         try {
//             actual = <string> ruleSetHandler(address, request);
//         }
//         catch (ex) {
//             actual = 'ERROR: ' + ex.message;
//             if (expected.slice(-3) === '...') {
//                 actual = actual.slice(0, expected.length - 3) + '...';
//             }
//         }
//         expect(actual).equals(expected);
//     }));
// });
