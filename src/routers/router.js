'use strict';
var handler_1 = require('../handlers/handler');
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
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
        let patternHierarchy = hierarchize_patterns_1.default(patterns);
        //var routeHierarchy = mapGraph(patternHierarchy, (value, key) => { return 42; }, (parent, child) => {});
        //         // TODO: hierarchize patterns!
        //         let patternDAG = hierarchizePatterns(patterns);
        //         let allNodes: {[pattern: string]: Node} = {};
        //         let nodeFor = (pattern: string) => allNodes[pattern] || (allNodes[pattern] = makeNode(pattern));
        //         let dummy = patternDAG['…'];
        // 
        //         traverse('…', patternDAG['…']);
        // 
        //         // Build Node DAG
        //         function traverse(pattern: string, specializations: typeof dummy, parent?: Node) {
        //             let node = nodeFor(pattern);
        //             if (parent) node.lessSpecialized.push(parent); // uplinks
        //             if (node.pattern) return; // already visited
        // 
        //             let i = patterns.findIndex(p => pattern === p.signature);
        //             node.pattern = patterns[i];
        //             node.handler = handlers[i];
        //             node.moreSpecialized = Object.keys(specializations).map(nodeFor); // downlinks
        //             let keys = Object.keys(specializations);
        //             keys.forEach(key => traverse(key, specializations[key], node));
        //         }
        // 
        //         // Ensure each decorator appears only once in the DAG
        //         // TODO: this is more restrictive that necessary. Better way?
        //         // let dupliDecors = Object.keys(allNodes).filter(key => allNodes[key].handler.isDecorator && allNodes[key].lessSpecialized.length > 1);
        //         // assert(dupliDecors.length === 0, `split decorators: '${dupliDecors.join("', '")}'`); // TODO: improve error message
        // 
        //         // Set root node
        //         this.root = nodeFor('…');
    }
    // TODO: doc...
    dispatch(request) {
        // TODO: ...
        let pathname = request.pathname;
        let path = [];
        let node = this.root; // always starts with '…'; don't need to check this against pathname
        while (true) {
            path.push(node);
            let foundChild = null;
            for (let i = 0; !foundChild && i < node.moreSpecialized.length; ++i) {
                let child = node.moreSpecialized[i];
                if (child.isMatch(pathname))
                    foundChild = child;
            }
            if (!foundChild)
                break;
            node = foundChild;
        }
        // should have a path here...
        let fullPath = path.map(n => n.signature).join('   ==>   ');
        //debugger;
        return null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
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
//# sourceMappingURL=router.js.map