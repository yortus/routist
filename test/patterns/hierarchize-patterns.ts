'use strict';
import {expect} from 'chai';
import hierarchizePatterns from '../../src/patterns/hierarchize-patterns';
import Pattern from '../../src/patterns/pattern';


describe('Hierarchizing a set of patterns', () => {

    let patternSources = [
        'a*',
        '*m*',
        '*z',
        '**',
        '/bar',
        '/*',
        '/foo',
        '/foo/*.html',
        '/…o…o….html',
        '/**o**o**',
        '/bar',
        'a*',
        '/a/*',
        '/*/b',
        '/*z/b',
    ];

    let expected = {
        "…": {
            "a*": {
                "a*m*": {
                    "a*m*z": {}
                },
                "a*z": {
                    "a*m*z": {}
                }
            },
            "*m*": {
                "a*m*": {
                    "a*m*z": {}
                },
                "*m*z": {
                    "a*m*z": {}
                }
            },
            "*z": {
                "a*z": {
                    "a*m*z": {}
                },
                "*m*z": {
                    "a*m*z": {}
                }
            },
            "/*": {
                "/bar": {},
                "/*o*o*": {
                    "/foo": {},
                    "/*o*o*.html": {}
                }
            },
            "/…o…o…": {
                "/*o*o*": {
                    "/foo": {},
                    "/*o*o*.html": {}
                },
                "/…o…o….html": {
                    "/*o*o*.html": {},
                    "/foo/*.html": {},
                    "/a/*o*o*.html": {}
                },
                "/a/*o*o*": {
                    "/a/*o*o*.html": {}
                },
                "/*o*o*/b": {
                    "/*o*o*z/b": {}
                }
            },
            "/a/*": {
                "/a/*o*o*": {
                    "/a/*o*o*.html": {}
                },
                "/a/b": {}
            },
            "/*/b": {
                "/*o*o*/b": {
                    "/*o*o*z/b": {}
                },
                "/a/b": {},
                "/*z/b": {
                    "/*o*o*z/b": {}
                }
            },
            "/*z/b": {
                "/*o*o*z/b": {}
            }
        }
    };

    it('works', () => {
        let actual = hierarchizePatterns(patternSources);
        expect(actual).deep.equal(expected);
    });
});
