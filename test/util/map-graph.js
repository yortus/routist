'use strict';
var chai_1 = require('chai');
var map_graph_1 = require('../../src/util/map-graph');
describe('Mapping over an object graph', function () {
    var tests = [
        {
            input: {
                'foo*': {
                    'foobar': {}
                },
                '*bar': {
                    '[[foo*/foobar]]': null
                },
                'foo*bar': {
                    'fooXbar': {}
                }
            },
            addNode: function (key) { return ({ key: key, children: [] }); },
            addEdge: function (parent, child) { return parent.children.push(child); },
            checks: [
                "output.key === null",
                "output.children[0].key === 'foo*'",
                "output.children[1].key === '*bar'",
                "output.children[1].children[0].key === 'foobar'",
                "output.children[0].children[0] === output.children[1].children[0]",
                "output.children[2].children[0] !== output.children[0].children[0]",
            ]
        },
    ];
    var assert_ = chai_1.assert;
    tests.forEach(function (test, i) {
        var output;
        test.checks.forEach(function (check) { return it("Case " + (i + 1) + " - " + check, function () {
            if (!output) {
                patchRefs(test.input);
                var inputGraph = objToMap(test.input);
                console.log(mapToObj(inputGraph));
                output = map_graph_1.default(inputGraph, test.addNode, test.addEdge);
                console.log(mapToObj(output));
            }
            chai_1.expect(function () { return eval("assert_(" + check + ", 'check failed')"); }).to.not.throw();
        }); });
    });
});
// fixes up '[[...]]' backref nodes to make a true DAG
function patchRefs(current, root) {
    root = root || current;
    Object.keys(current).forEach(function (key) {
        if (key.indexOf('[[') === 0) {
            delete current[key];
            var parts = key.slice(2, -2).split('/');
            var newKey = parts[parts.length - 1];
            var newVal = parts.reduce(function (obj, key) { return obj[key]; }, root);
            current[newKey] = newVal;
        }
        else {
            patchRefs(current[key], root);
        }
    });
}
/** Helper function that converts a Graph<Pattern> to a simple nested object with pattern sources for keys */
function objToMap(obj) {
    var keys = Object.keys(obj);
    var result = keys.reduce(function (map, key) { return map.set(key, objToMap(obj[key])); }, new Map());
    return result;
}
/** Helper function that converts a Graph<Pattern> to a simple nested object with pattern sources for keys */
function mapToObj(map) {
    var keys = Array.from(map.keys());
    return keys.reduce(function (obj, key) { return (obj[key] = mapToObj(map.get(key)), obj); }, {});
}
//# sourceMappingURL=map-graph.js.map