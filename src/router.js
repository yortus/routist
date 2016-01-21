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
        // TODO: hierarchize patterns!
        let dag = hierarchize_patterns_1.default(patterns);
    }
    // TODO: doc...
    dispatch(request) {
        // TODO: ...
        return null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
//# sourceMappingURL=router.js.map