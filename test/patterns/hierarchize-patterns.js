'use strict';
var chai_1 = require('chai');
var hierarchize_patterns_1 = require('../../src/patterns/hierarchize-patterns');
var pattern_1 = require('../../src/patterns/pattern');
describe('Hierarchizing a set of patterns', function () {
    var patternSources = [
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
    var expected = {
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
    it('works', function () {
        var patterns = patternSources.map(function (ps) { return new pattern_1.default(ps); });
        var actual = mapToObj(hierarchize_patterns_1.default(patterns)); // TODO: review this line...
        chai_1.expect(actual).deep.equal(expected);
    });
});
// TODO: doc...
function mapToObj(map) {
    var patterns = Array.from(map.keys());
    return patterns.reduce(function (obj, pat) { return (obj[pat.source] = mapToObj(map.get(pat)), obj); }, {});
}
//# sourceMappingURL=hierarchize-patterns.js.map