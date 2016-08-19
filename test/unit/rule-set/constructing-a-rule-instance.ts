import {expect} from 'chai';
import {Rule} from 'routist';
// TODO: add some asynchronous cases (with results, null, errors)...


describe('Constructing a Rule instance', () => {

    let tests = [
        {
            pattern: '/api/{...rest}',
            handler: (rest) => {},
            paramNames: ['rest'],
            isDecorator: false,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: ($req, rest) => {},
            paramNames: ['$req', 'rest'],
            isDecorator: false,
            error: null
        },
        {
            pattern: '/api/…',
            handler: () => {},
            paramNames: [],
            isDecorator: false,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: () => {},
            paramNames: [],
            isDecorator: false,
            error: `Capture name(s) 'rest' unused by handler...`
        },
        {
            pattern: '/api/…',
            handler: (rest) => {},
            paramNames: ['rest'],
            isDecorator: false,
            error: `Handler parameter(s) 'rest' not captured by pattern...`
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: (path, ext, $req, name) => {},
            paramNames: ['path', 'ext', '$req', 'name'],
            isDecorator: false,
            error: null
        },
        {
            pattern: '/foo/{...path}/{name}.{ext}',
            handler: (path, ext, req, name) => {},
            paramNames: ['path', 'ext', 'req', 'name'],
            isDecorator: false,
            error: `Handler parameter(s) 'req' not captured by pattern...`
        },
        {
            pattern: '/api/{...$req}',
            handler: ($req) => {},
            paramNames: [],
            isDecorator: undefined,
            error: `Use of reserved name(s) '$req' as capture(s) in pattern...`
        },
        {
            pattern: '/api/{...req}',
            handler: ($req) => {},
            paramNames: ['$req'],
            isDecorator: undefined,
            error: `Capture name(s) 'req' unused by handler...`
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $req, $next) => {},
            paramNames: ['rest', '$req', '$next'],
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest}',
            handler: (rest, $next) => {},
            paramNames: ['rest', '$next'],
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest} #2',
            handler: (rest, $next) => {},
            paramNames: ['rest', '$next'],
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest} #1000',
            handler: (rest, $next) => {},
            paramNames: ['rest', '$next'],
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/{...rest} #comment',
            handler: (rest, $next) => {},
            paramNames: ['rest', '$next'],
            isDecorator: true,
            error: null
        },
        {
            pattern: '#/api/{...rest}',
            handler: (rest, $next) => {},
            paramNames: ['rest', '$next'],
            isDecorator: true,
            error: `Handler parameter(s) 'rest' not captured by pattern...`
        },
        {
            pattern: '/api/{...rest} # 2 0 abc   ',
            handler: (rest, $next) => {},
            paramNames: ['rest', '$next'],
            isDecorator: true,
            error: null
        },
        {
            pattern: '/api/x # was... /{...rest}',
            handler: () => {},
            paramNames: [],
            isDecorator: false,
            error: null
        },
    ];

    tests.forEach(test => {
        it(`${test.pattern} WITH ${test.handler}`, () => {
            let expectedParamNames = test.paramNames;
            let expectedIsDecorator = test.isDecorator;
            let expectedError = test.error || '';
            let actualParamNames: string[];
            let actualIsDecorator: boolean;
            let actualError = '';
            let rule: Rule;
            try {
                rule = new Rule(test.pattern, test.handler);
                actualParamNames = rule.parameterNames;
                actualIsDecorator = rule.isDecorator;
            }
            catch (ex) {
                actualError = ex.message;
                if (expectedError && expectedError.slice(-3) === '...') {
                    actualError = actualError.slice(0, expectedError.length - 3) + '...';
                }
            }
            if (expectedError || actualError) {
                expect(actualError).equals(expectedError);
            }
            else {
                expect(rule.pattern.toString()).equals(test.pattern);
                expect(rule.handler).equals(test.handler);
                expect(actualParamNames).deep.equal(expectedParamNames);
                expect(actualIsDecorator).equals(expectedIsDecorator);
            }
        });
    });
});
