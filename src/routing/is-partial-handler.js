'use strict';
var util_1 = require('../util');
// TODO: revise docs below...
/**
 * Indicates whether or not `handler` is a decorator. A handler is a decorator
 * if its action function includes the name '$next' as a formal parameter. See
 * Handler#execute for more information on execution differences between decorators
 * and non-decorators.
 */
function isPartialHandler(handler) {
    // TODO: super inefficient!!! Review this...    
    return util_1.getFunctionParameterNames(handler).indexOf('$next') === -1;
    // TODO: was... return handler.length === 2;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isPartialHandler;
//# sourceMappingURL=is-partial-handler.js.map