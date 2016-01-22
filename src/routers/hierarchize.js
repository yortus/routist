'use strict';
//import * as assert from 'assert';
var handler_1 = require('../handlers/handler');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
//import Request from '../request';
//import Response from '../response';
var pattern_1 = require('../patterns/pattern');
// TODO: doc...
function hierarchize(patterns, handlers) {
    // Arrange all the given patterns into a DAG rooted at '…'.
    let patternHierarchy = hierarchize_patterns_1.default(patterns);
    // Construct a DAG with the same topology, but whose nodes hold additional info.
    // - call this a Route?
    // - pattern and handler
    // - uplinks (less specialized routes)
    // - downlinks (more specialized routes)
    // declare function mapGraph<INode, ONode>(graph: INode, transform: (iNode: INode) => ONode, addEdge: (parent: ONode, child: ONode) => void): ONode
    // - generalized 'mapGraph' function?
    // - transform callback for input node to output node
    // - don't re-process same node (same = '===')
    // - callback to add directed edge between two output nodes
    // TODO: add root pattern/handler if not there already
    if (!patterns.some(p => p.signature === '…')) {
        let rootPattern = new pattern_1.default('…');
        patterns.push(rootPattern);
        handlers.push(new handler_1.default(rootPattern, () => { throw new Error('404!'); }));
    }
    // TODO: hierarchize patterns!
    let patternDAG = hierarchize_patterns_1.default(patterns);
    let allNodes = {};
    let nodeFor = (pattern) => allNodes[pattern] || (allNodes[pattern] = makeNode(pattern));
    let dummy = patternDAG['…'];
    traverse('…', patternDAG['…']);
    // Build Node DAG
    function traverse(pattern, specializations, parent) {
        let node = nodeFor(pattern);
        if (parent)
            node.lessSpecialized.push(parent); // uplinks
        if (node.pattern)
            return; // already visited
        let i = patterns.findIndex(p => pattern === p.signature);
        node.pattern = patterns[i];
        node.handler = handlers[i];
        node.moreSpecialized = Object.keys(specializations).map(nodeFor); // downlinks
        let keys = Object.keys(specializations);
        keys.forEach(key => traverse(key, specializations[key], node));
    }
    // Ensure each decorator appears only once in the DAG
    // TODO: this is more restrictive that necessary. Better way?
    // let dupliDecors = Object.keys(allNodes).filter(key => allNodes[key].handler.isDecorator && allNodes[key].lessSpecialized.length > 1);
    // assert(dupliDecors.length === 0, `split decorators: '${dupliDecors.join("', '")}'`); // TODO: improve error message
    // Set root node
    this.root = nodeFor('…');
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hierarchize;
// TODO: doc...
function makeNode(signature) {
    let result = {
        signature: signature,
        pattern: null,
        handler: null,
        lessSpecialized: [],
        moreSpecialized: [],
        isMatch: null
    };
    let quickPattern = new pattern_1.default(signature);
    result.isMatch = (pathname) => quickPattern.match(pathname) !== null;
    return result;
}
//# sourceMappingURL=hierarchize.js.map