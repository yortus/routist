'use strict';
import {expect} from 'chai';
import normalizeHandler from '../src/normalize-handler';


describe('normalization of a handler function', () => {

    let tests = [
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handlerParamNames: 'rest',
            handlerArgValues: 'foo/bar/baz.html'
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handlerParamNames: 'req, rq, rest',
            handlerArgValues: '[object Object], [object Object], foo/bar/baz.html'
        },
        {
            pattern: '/api/…',
            pathname: '/api/foo/bar/baz.html',
            handlerParamNames: '',
            handlerArgValues: ''
        },
        {
            pattern: '/api/{...rest}',
            pathname: '/api/foo/bar/baz.html',
            handlerParamNames: '',
            handlerArgValues: 'ERROR'
        },
        {
            pattern: '/api/…',
            pathname: '/api/foo/bar/baz.html',
            handlerParamNames: 'rest',
            handlerArgValues: 'ERROR'
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            pathname: '/foo/bar/baz.html',
            handlerParamNames: 'path, name, req, ext',
            handlerArgValues: 'bar, baz, [object Object], html'
        }
    ];

    tests.forEach((test, i) => {
        it(`${test.pattern} WITH function (${test.handlerParamNames}) {...}`, () => {
            let handler = makeHandlerOrdinaryFunction(test.handlerParamNames);
            let canonicalHandler = normalizeHandler(test.pattern, handler);
            let request = { pathname: test.pathname };
            let expectedArgs = test.handlerArgValues;
            let actualArgs = 'ERROR';
            try { actualArgs = <any> canonicalHandler(request); }
            catch (ex) { }
            expect(actualArgs).equals(expectedArgs);
        });
        it(`${test.pattern} WITH (${test.handlerParamNames}) => (...)`, () => {
            let handler = makeHandlerArrowFunction(test.handlerParamNames);
            let canonicalHandler = normalizeHandler(test.pattern, handler);
            let request = { pathname: test.pathname };
            let expectedArgs = test.handlerArgValues;
            let actualArgs = 'ERROR';
            try { actualArgs = <any> canonicalHandler(request); }
            catch (ex) { }
            expect(actualArgs).equals(expectedArgs);
        });
    });

    function makeHandlerOrdinaryFunction(paramNames: string) {
        return eval(`(
            function (${paramNames}) {
                return [${paramNames}].map(arg => arg.toString()).join(', ');
            }
        )`);
    }

    function makeHandlerArrowFunction(paramNames: string) {
        return eval(`(
            (${paramNames}) => [${paramNames}].map(arg => arg.toString()).join(', ')
        )`);
    }
});
