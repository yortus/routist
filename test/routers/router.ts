'use strict';
import {expect} from 'chai';
import Router from '../../src/routers/router';


describe('Constructing a router instance', () => {

    it('works', () => {

        let routeTable: {[pattern: string]: Function} = {
            '/foo': () => 'foo',
            '/bar': () => 'bar',
            '/baz': () => 'baz',
            '/{thing}': thing => thing,

            'a/*': () => {},
            '*/b': () => {},




        };

        let router = new Router();
        router.add(routeTable);
        //router.dispatch({pathname: 'a/b'});

    });
});
