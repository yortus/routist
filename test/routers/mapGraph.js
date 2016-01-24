'use strict';
var chai_1 = require('chai');
var mapGraph_1 = require('../../src/routers/mapGraph');
describe('Mapping over an object graph', () => {
    let tests = [
        {
            input: {
                'foo*': {
                    'foobar': {}
                },
                '*bar': {
                    'foobar': '[[foo*/foobar]]'
                },
                'foo*bar': {
                    'foobar': {}
                }
            },
            addNode: (value, key) => ({ key: key, children: [] }),
            addEdge: (parent, child) => parent.children.push(child),
            checks: [
                `output.key === null`,
                `output.children[0].key === 'foo*'`,
                `output.children[1].key === '*bar'`,
                `output.children[1].children[0].key === 'foobar'`,
                `output.children[0].children[0] === output.children[1].children[0]`,
                `output.children[2].children[0] !== output.children[0].children[0]`,
            ]
        },
        {
            input: {
                '**': {
                    'a*': {
                        'ab': {},
                        'a*z': {
                            'aazz': {}
                        }
                    },
                    '*b': {
                        'ab': '[[**/a*/ab]]',
                    },
                    'a*z': {
                        'aazz': '[[**/a*/a*z/aazz]]'
                    }
                }
            },
            addNode: (value, key) => ({ key: key, down: [], up: [] }),
            addEdge: (parent, child) => {
                parent.down.push(child);
                child.up.push(parent);
            },
            checks: [
                `output.up.length === 0`,
                `output.down[0].key === '**'`,
                `output.down[0].down.length === 3`,
                `output.down[0].down[0].down[0].key === 'ab'`,
                `output.down[0].down[1].down[0].key === 'ab'`,
                `output.down[0].down[0].down[0].up.length === 2`,
                `output.down[0].down[1].down[0].up.length === 2`,
                `output.down[0].down[0].down[0] === output.down[0].down[1].down[0]`,
                `output.down[0].down[0].down[1].down[0].key === 'aazz'`,
                `output.down[0].down[0].down[1].down[0].up.length === 2`,
                `output.down[0].down[0].down[1].down[0].down.length === 0`,
                `output.down[0].down[0].down[1].down[0] === output.down[0].down[2].down[0]`
            ]
        }
    ];
    let assert_ = chai_1.assert;
    tests.forEach((test, i) => {
        let output;
        test.checks.forEach(check => it(`Case ${i + 1} - ${check}`, () => {
            if (!output) {
                patchRefs(test.input);
                output = mapGraph_1.default(test.input, { addNode: test.addNode, addEdge: test.addEdge });
            }
            chai_1.expect(() => eval(`assert_(${check}, 'check failed')`)).to.not.throw();
        }));
    });
    // fixes up '[[...]]' backref nodes to make a true DAG
    function patchRefs(current, root) {
        root = root || current;
        Object.keys(current).forEach(key => {
            let val = current[key];
            if (typeof val === 'string') {
                current[key] = val.slice(2, -2).split('/').reduce((obj, key) => obj[key], root);
            }
            else {
                patchRefs(current[key], root);
            }
        });
    }
});
//# sourceMappingURL=mapGraph.js.map