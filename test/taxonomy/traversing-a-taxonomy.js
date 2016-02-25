'use strict';
var chai_1 = require('chai');
var pattern_1 = require('../../src/pattern');
var taxonomy_1 = require('../../src/taxonomy');
describe('Traversing a taxonomy', function () {
    var tests = [
        ['foo', 'bar', 'f{chars}', '*o'],
        ['**', '/f**', '/foo/*', '/foo', '/*o', '/foo'],
        ['a', 'b', 'c', 'd', 'e', 'f'],
        ['a', 'a', 'a', 'a', 'a', 'a'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*', 'a/b', 'a/*', '*/b/b']
    ];
    tests.forEach(function (test) {
        it(test.join(', '), function () {
            var patterns = test.map(function (p) { return new pattern_1.default(p); });
            var taxonomy = new taxonomy_1.default(patterns);
            // A taxonomy is always rooted at '…'.
            chai_1.expect(taxonomy.rootNode.pattern).equals(pattern_1.default.UNIVERSAL);
            // All input patterns are in the taxonomy constructed from them.
            var taxonomyPatterns = taxonomy.allNodes.map(function (node) { return node.pattern; });
            chai_1.expect(patterns.every(function (p) { return taxonomyPatterns.indexOf(p.normalized) !== -1; })).to.be.true;
            // Every child node's pattern matches a subset of the addresses matched by its parent node's pattern.
            var edges = getAllEdges(taxonomy.rootNode);
            chai_1.expect(edges.every(function (edge) { return edge.parent.pattern.intersect(edge.child.pattern) === edge.child.pattern; })).to.be.true;
        });
    });
});
/** Helper function that enumerates all edges in a taxonomy. */
function getAllEdges(node) {
    var direct = node.specializations.map(function (spec) { return ({ parent: node, child: spec }); });
    var all = direct.concat.apply(direct, node.specializations.map(getAllEdges));
    return all;
}
//# sourceMappingURL=traversing-a-taxonomy.js.map