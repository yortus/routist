'use strict';
var handler_1 = require('./handlers/handler');
var hierarchize_patterns_1 = require('./patterns/hierarchize-patterns');
var pattern_1 = require('./patterns/pattern');
class Router {
    // TODO: doc...
    constructor() {
    }
    add(routes) {
        // Construct flat lists of all the patterns and handlers for the given routes.
        let patterns;
        let handlers;
        if (Array.isArray(routes)) {
            patterns = routes.map(route => new pattern_1.default(route[0]));
            handlers = routes.map((route, i) => new handler_1.default(patterns[i], route[1]));
        }
        else {
            let keys = Object.keys(routes);
            patterns = keys.map(key => new pattern_1.default(key));
            handlers = keys.map((key, i) => new handler_1.default(patterns[i], routes[key]));
        }
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
        debugger;
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
    }
    // TODO: doc...
    dispatch(request) {
        // TODO: ...
        return null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
// TODO: doc...
function makeNode(signature) {
    return {
        signature: signature,
        pattern: null,
        handler: null,
        lessSpecialized: [],
        moreSpecialized: []
    };
}
//# sourceMappingURL=router.js.map