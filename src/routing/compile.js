'use strict';
var hierarchize_patterns_1 = require('../patterns/hierarchize-patterns');
var pattern_1 = require('../patterns/pattern');
// temp testing...
var router2_1 = require('./router2');
var make_dispatcher_1 = require('./make-dispatcher');
// TODO: doc...
function compile(routeTable) {
    var routes = router2_1.default(routeTable); // TODO: fix terminology: 'handler' is taken...
    var patternHierarchy = hierarchize_patterns_1.default(Object.keys(routeTable).map(function (src) { return new pattern_1.default(src); }));
    var selectRoute = make_dispatcher_1.default(patternHierarchy, routes);
    function __compiledRouteTable__(request) {
        var address = typeof request === 'string' ? request : request.address;
        var route = selectRoute(address);
        var response = route(request);
        return response;
    }
    ;
    return __compiledRouteTable__;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compile;
//# sourceMappingURL=compile.js.map