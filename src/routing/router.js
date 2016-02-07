'use strict';
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
// temp testing...
var router2_1 = require('./router2');
var make_dispatch_function_1 = require('./make-dispatch-function');
// TODO: doc...
var Router = (function () {
    // TODO: doc...
    function Router() {
    }
    // TODO: doc...
    Router.prototype.add = function (routeTable) {
        var patternHierarchy = hierarchize_patterns_1.default(Object.keys(routeTable).map(function (src) { return new pattern_1.default(src); }));
        var dispatch = make_dispatch_function_1.default(patternHierarchy);
        var routes = router2_1.default(routeTable); // TODO: fix terminology: 'handler' is taken...
        this.dispatch = function (request) {
            var address = typeof request === 'string' ? request : request.address;
            var pattern = dispatch(address);
            var route = routes.get(pattern);
            var response = route.execute(request);
            return response;
        };
    };
    // TODO: doc...
    Router.prototype.dispatch = function (request) {
        throw new Error("Not ready!!! Call add first..."); // TODO: fix this...
    };
    ;
    return Router;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Router;
//# sourceMappingURL=router.js.map