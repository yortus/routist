'use strict';
// TODO: revise docs below...
/**
 * Indicates whether or not `handler` is a decorator. A handler is a decorator
 * if its action function includes the name '$next' as a formal parameter. See
 * Handler#execute for more information on execution differences between decorators
 * and non-decorators.
 */
function isPartialHandler(handler) {
    return handler.length === 2;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isPartialHandler;
//# sourceMappingURL=is-partial-handler.js.map