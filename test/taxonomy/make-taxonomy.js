'use strict';
var chai_1 = require('chai');
var make_taxonomy_1 = require('../../src/taxonomy/make-taxonomy');
var pattern_1 = require('../../src/pattern');
describe('Forming a taxonomy of patterns', function () {
    var tests = [
        {
            // ======================================== 1. ========================================
            name: 'simple tree',
            patterns: [
                '/**',
                '/foo/*',
                '/bar/*',
                '/foo/bar'
            ],
            taxonomy: {
                "/…": {
                    "/foo/*": {
                        "/foo/bar": {}
                    },
                    "/bar/*": {}
                }
            }
        },
        {
            // ======================================== 2. ========================================
            name: 'impossible intersections',
            patterns: [
                '**',
                'a*',
                '*a',
            ],
            taxonomy: 'ERROR: Intersection of *a and a* cannot be expressed as a single pattern...'
        },
        {
            // ======================================== 3. ========================================
            name: 'complex DAG',
            patterns: [
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
            ],
            taxonomy: {
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
        }
    ];
    tests.forEach(function (test) {
        it(test.name, function () {
            var patterns = test.patterns.map(function (ps) { return new pattern_1.default(ps); });
            var expected = test.taxonomy;
            var actual;
            try {
                actual = nodeToObj(make_taxonomy_1.default(patterns));
            }
            catch (ex) {
                actual = 'ERROR: ' + ex.message;
                if (typeof expected === 'string' && expected.slice(-3) === '...') {
                    actual = actual.slice(0, expected.length - 3) + '...';
                }
            }
            chai_1.expect(actual).deep.equal(expected);
        });
    });
});
/** Helper function that converts a Taxonomy to a simple nested object with pattern sources for keys */
function nodeToObj(node) {
    return node.specializations.reduce(function (obj, node) { return (obj[node.pattern.toString()] = nodeToObj(node), obj); }, {});
}
//# sourceMappingURL=make-taxonomy.js.map