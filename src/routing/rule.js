'use strict';
var make_normalized_handler_function_1 = require('./make-normalized-handler-function');
// TODO: review jsdocs after pattern overhaul
// TODO: make async...
// TODO: review all comments given recent changes (Handler/Rule, $yield/$next, executeDownstreamHandlers/downstream)
/**
 * A handler provides a standarized means for transforming a request to a response,
 * according to the particulars of the pattern/action pair it was constructed with.
 */
var Rule = (function () {
    /**
     * Constructs a Rule instance.
     * @param {string} patternSource - the pattern recognized by this handler.
     * @param {Function} handler - a function providing processing logic for producing
     *        a reponse from a given request. The `action` function may be invoked when
     *        the `Handler#execute` method is called. Each of the `action` function's
     *        formal parameter names must match either a capture name from `pattern`, or
     *        a builtin name such as `$req` or `$yield`. Capture values and/or builtin
     *        values are passed to the matching parameters of `action` upon invocation.
     *        A non-null return value from `action` is interpreted as a response. A null
     *        return value from `action` signifies that the action declined to respond to
     *        the given request, even if the pattern matched the request's address.
     */
    function Rule(pattern, handler) {
        this.pattern = pattern;
        this.handler = handler;
        this.execute = make_normalized_handler_function_1.default(pattern, handler);
        this.isDecorator = this.execute.length === 2;
    }
    /** Returns a textual representation of this Rule instance. */
    Rule.prototype.toString = function () { return "'" + this.pattern + "': " + this.handler; };
    return Rule;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Rule;
//# sourceMappingURL=rule.js.map