'use strict';
var is_decorator_1 = require('./is-decorator');
// TODO: ...
var Route = (function () {
    // TODO: ...
    function Route(name, handlers) {
        this.handlers = handlers;
        // TODO: ...
        this.name = name;
        // TODO: ...
        var reverseHandlers = handlers.slice().reverse();
        this.execute = reverseHandlers.reduce(function (downstream, handler) {
            if (is_decorator_1.default(handler)) {
                return function (request) { return handler(request, downstream); };
            }
            else {
                return function (request) {
                    var response = downstream(request);
                    if (response !== null)
                        return response;
                    return handler(request);
                };
            }
        }, noMore);
    }
    return Route;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Route;
// TODO: ...
var noMore = function (rq) { return null; };
//# sourceMappingURL=route.js.map