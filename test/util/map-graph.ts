// 'use strict';
// import {expect, assert} from 'chai';
// import Graph from '../../src/util/graph';
// import mapGraph from '../../src/util/map-graph';
// 
// 
// describe('Mapping over an object graph', () => {
// 
//     let tests = [
//         {   // ========== Case 1: ==========
//             input: {
//                 'foo*': {
//                     'foobar': {}
//                 },
//                 '*bar': {
//                     '[[foo*/foobar]]': null
//                 },
//                 'foo*bar': {
//                     'fooXbar': {}
//                 }
//             },
//             addNode: (key) => ({ key, children: [] }),
//             addEdge: (parent, child) => parent.children.push(child),
//             checks: [
//                 `output.key === null`,
//                 `output.children[0].key === 'foo*'`,
//                 `output.children[1].key === '*bar'`,
//                 `output.children[1].children[0].key === 'foobar'`,
//                 `output.children[0].children[0] === output.children[1].children[0]`,
//                 `output.children[2].children[0] !== output.children[0].children[0]`,
//             ]
//         },
//         // {   // ========== Case 2: ==========
//         //     input: {
//         //         '**': {
//         //             'a*': {
//         //                 'ab': {},
//         //                 'a*z': {
//         //                     'aazz': {}
//         //                 }
//         //             },
//         //             '*b': {
//         //                 'ab': '[[**/a*/ab]]',
//         //             },
//         //             'a*z': {
//         //                 'aazz': '[[**/a*/a*z/aazz]]'
//         //             }
//         //         }
//         //     },
//         //     addNode: (key) => ({ key, down: [], up: [] }),
//         //     addEdge: (parent, child) => {
//         //         parent.down.push(child);
//         //         child.up.push(parent);
//         //     },
//         //     checks: [
//         //         `output.up.length === 0`,
//         //         `output.down[0].key === '**'`,
//         //         `output.down[0].down.length === 3`,
//         //         `output.down[0].down[0].down[0].key === 'ab'`,
//         //         `output.down[0].down[1].down[0].key === 'ab'`,
//         //         `output.down[0].down[0].down[0].up.length === 2`,
//         //         `output.down[0].down[1].down[0].up.length === 2`,
//         //         `output.down[0].down[0].down[0] === output.down[0].down[1].down[0]`,
//         //         `output.down[0].down[0].down[1].down[0].key === 'aazz'`,
//         //         `output.down[0].down[0].down[1].down[0].up.length === 2`,
//         //         `output.down[0].down[0].down[1].down[0].down.length === 0`,
//         //         `output.down[0].down[0].down[1].down[0] === output.down[0].down[2].down[0]`
//         //     ]
//         // }
//     ];
// 
//     let assert_ = assert;
//     tests.forEach((test, i) => {
//         let output;
//         test.checks.forEach(check => it(`Case ${i + 1} - ${check}`, () => {
//             if (!output) {
//                 patchRefs(test.input);
//                 let inputGraph = objToMap(test.input);
// console.log(mapToObj(inputGraph));
// 
//                 output = mapGraph(inputGraph, test.addNode, test.addEdge);
// console.log(mapToObj(output));
//             }
//             expect(() => eval(`assert_(${check}, 'check failed')`)).to.not.throw();
//         }));
//     });
// });
// 
// 
// // fixes up '[[...]]' backref nodes to make a true DAG
// function patchRefs(current: {}, root?: {}) {
//     root = root || current;
//     Object.keys(current).forEach(key => {
//         if (key.indexOf('[[') === 0) {
//             delete current[key];
//             let parts = key.slice(2, -2).split('/');
//             let newKey = parts[parts.length - 1];
//             let newVal = parts.reduce((obj, key) => obj[key], root);
//             current[newKey] = newVal;
//         }
//         else {
//             patchRefs(current[key], root);
//         }
//     });
// }
// 
// 
// /** Helper function that converts a Graph<Pattern> to a simple nested object with pattern sources for keys */
// function objToMap(obj: {}): Graph<string> {
//     let keys = Object.keys(obj);
//     let result = keys.reduce(
//         (map, key) => map.set(key, objToMap(obj[key])),
//         new Map<string, Graph<string>>()
//     );
//     return result;
// }
// 
// 
// /** Helper function that converts a Graph<Pattern> to a simple nested object with pattern sources for keys */
// function mapToObj(map: Graph<any>): {} {
//     let keys = Array.from(map.keys());
//     return keys.reduce((obj, key) => (obj[key] = mapToObj(map.get(key)), obj), {});
// }
