'use strict';
// TODO: revise doc...
/**
 * Indicates whether or not `handler` is a decorator. A handler is a decorator
 * if its action function includes the name '$next' as a formal parameter. See
 * Handler#execute for more information execution differences between decorators
 * and non-decorators.
 */
function isDecorator(handler) {
    return handler.length === 2;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isDecorator;
//# sourceMappingURL=is-decorator.js.map