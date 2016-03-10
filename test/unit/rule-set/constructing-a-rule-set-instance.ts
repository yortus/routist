'use strict';
import {async, await} from 'asyncawait';
import {expect} from 'chai';
import {RuleSet, util} from 'routist';
// TODO: rename these tests in filename and describe() ? this is more about executing the RuleSet, no constructing it...
// TODO: more ruleset tests? for other files?


// TODO: More coverage:
// - [ ] multiple non-decorator handlers for same pattern
// - [ ] multiple decorator handlers for same pattern
// - [ ] one decorator and some non-decorators for same pattern
// - [ ] decorators along ambiguous paths (same decorators on all paths)
// - [x] decorators along ambiguous paths (not same decorators on all paths) - c/d


let variants = [
    { name: 'all synchronous', val: immediateValue, err: immediateError },
    { name: 'all asynchronous', val: promisedValue, err: promisedError },
    { name: 'randomized sync/async', val: randomValue, err: randomError }
];


variants.forEach(variant => describe(`Constructing a RuleSet instance (${variant.name})`, () => {

    let val = variant.val, err = variant.err;

    let ruleSet: {[pattern: string]: Function} = {
        '/...': () => err('nothing matches!'),
        '/foo': () => val('foo'),
        '/bar': () => val('bar'),
        '/baz': () => val('baz'),
        '/*a*': ($next) => val(`---${await($next()) || await(err('no downstream!'))}---`),

        'a/*': () => val(`starts with 'a'`),
        '*/b': () => val(`ends with 'b'`),
        'a/b': () => val(`starts with 'a' AND ends with 'b'`),

        'c/*': () => val(`starts with 'c'`),
        '*/d': () => err(`don't end with 'd'!`),
        'c/d': () => val(null),

        'api/... #a': () => val(`fallback`),
        'api/... #b': () => val(`fallback`), // TODO: temp testing, remove this...
        'api/fo*o': () => val(null),
        'api/fo* #2': ($req, $next) => val(`fo2-(${await($next($req)) || 'NONE'})`),
        'api/fo* #1': ($req, $next) => val(`fo1-(${await($next($req)) || 'NONE'})`),
        'api/foo ': ($req, $next) => val(`${await($next($req)) || 'NONE'}!`),
        'api/foo': () => val('FOO'),
        'api/foot': () => val('FOOt'),
        'api/fooo': () => val('fooo'),
        'api/bar': () => val(null),

        'zzz/{...rest}': ($next, rest) => val(`${await($next({address: rest.split('').reverse().join('')})) || 'NONE'}`),
        'zzz/b*z': ($req) => val(`${$req.address}`),
        'zzz/./*': () => val('forty-two')
    };

    let tests = [
        `/foo ==> foo`,
        `/bar ==> ---bar---`,
        `/baz ==> ---baz---`,
        `/quux ==> ERROR: nothing matches!`,
        `quux ==> UNHANDLED`,
        `/qaax ==> ERROR: no downstream!`,
        `/a ==> ERROR: no downstream!`,
        `a ==> UNHANDLED`,
        `/ ==> ERROR: nothing matches!`,
        ` ==> UNHANDLED`,

        `a/foo ==> starts with 'a'`,
        `foo/b ==> ends with 'b'`,
        `a/b ==> starts with 'a' AND ends with 'b'`,

        `c/foo ==> starts with 'c'`,
        `foo/d ==> ERROR: don't end with 'd'!`,
        `c/d ==> ERROR: Multiple possible fallbacks...`,

        `api/ ==> fallback`,
        `api/foo ==> fo2-(fo1-(FOO!))`,
        `api/fooo ==> fo2-(fo1-(fooo))`,
        `api/foooo ==> fo2-(fo1-(NONE))`,
        `api/foooot ==> fo2-(fo1-(NONE))`,
        `api/foot ==> fo2-(fo1-(FOOt))`,
        `api/bar ==> fallback`,

        `zzz/baz ==> zab`,
        `zzz/booz ==> zoob`,
        `zzz/looz ==> NONE`,
        `zzz/./{whatever} ==> forty-two`
    ];

    let ruleSetHandler = new RuleSet<{address:string}, string>(ruleSet).execute;

    tests.forEach(test => it(test, async.cps(() => {
        let address = test.split(' ==> ')[0];
        let request = {address};
        let expected = test.split(' ==> ')[1];
        if (expected === 'UNHANDLED') expected = null;
        let actual: string;
        try {
            let res = ruleSetHandler(address, request);
            actual = util.isPromiseLike(res) ? await (res) : res;
        }
        catch (ex) {
            actual = 'ERROR: ' + ex.message;
            if (expected.slice(-3) === '...') {
                actual = actual.slice(0, expected.length - 3) + '...';
            }
        }
        expect(actual).equals(expected);
    })));
}));


// TODO: doc helpers...
function immediateValue(val) {
    return val;
}
function immediateError(msg): any {
    throw new Error(msg);
}


// TODO: doc helpers...
function promisedValue(val) {
    return new Promise(resolve => {
        setTimeout(() => resolve(val), 5);
    });
}
function promisedError(msg) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(msg)), 5);
    });
}


// TODO: doc helpers...
function randomValue(val) {
    let impls = [immediateValue, promisedValue];
    let impl = impls[Math.floor(Math.random() * impls.length)];
    return impl(val);
}
function randomError(msg) {
    let impls = [immediateError, promisedError];
    let impl = impls[Math.floor(Math.random() * impls.length)];
    return impl(msg);
}
