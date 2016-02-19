'use strict';
var chai_1 = require('chai');
var pattern_1 = require('../../src/pattern');
describe('Comparing patterns with their normalized forms', function () {
    var patterns = [
        '/*/bar/{...baz}',
        '/*/bar/…',
        '/{n}/bar/**',
        '/{__}/bar/{...baz}'
    ];
    patterns.forEach(function (a1) {
        var p1 = new pattern_1.default(a1);
        it("'" + a1 + "' vs normalised", function () {
            chai_1.expect(a1 === p1.normalized.toString()).equals(p1 === p1.normalized);
        });
        patterns.forEach(function (a2) {
            var p2 = new pattern_1.default(a2);
            it("'" + a1 + "' vs '" + a2 + "'", function () {
                chai_1.expect(p1.normalized).equals(p2.normalized);
            });
        });
    });
});
//# sourceMappingURL=comparing-patterns-with-their-normalized-forms.js.map