'use strict';
import {expect} from 'chai';
import Router from '../../src/routers/router';


describe('Constructing a router instance', () => {

    let routeTable: {[pattern: string]: Function} = {
        '/foo': () => 'foo',
        '/bar': () => 'bar',
        '/baz': () => 'baz',
        //'/{name}': $downstream => `---${$downstream.execute() || 'NONE'}---`,

        'a/*': () => `starts with 'a'`,
        '*/b': () => `ends with 'b'`,
        //'a/b': () => {}
    };

    let tests = [
        `/foo ==> foo`,
        `/bar ==> bar`,
        `/baz ==> baz`,
        `a/foo ==> starts with 'a'`,
        `foo/b ==> ends with 'b'`,
    ];

    let router = new Router();
    router.add(routeTable);

    tests.forEach(test => it(test, () => {
        let pathname = test.split(' ==> ')[0];
        let expected = test.split(' ==> ')[1];
        let actual = router.dispatch({pathname});
        expect(actual).equals(expected);
    }));
});
