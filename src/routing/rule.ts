'use strict';
import makeNormalizedHandlerFunction from './make-normalized-handler-function';
import Pattern from '../patterns/pattern';
import Request from '../request';
import Response from '../response';
// TODO: review jsdocs after pattern overhaul
// TODO: make async...
// TODO: review all comments given recent changes (Handler/Rule, $yield/$next, executeDownstreamHandlers/downstream)





/**
 * A handler provides a standarized means for transforming a request to a response,
 * according to the particulars of the pattern/action pair it was constructed with.
 */
export default class Rule {


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
    constructor(public pattern: Pattern, private handler: Function) {
        this.execute = <any> makeNormalizedHandlerFunction(pattern, handler);
        this.isDecorator = this.execute.length === 2;
    }


    /**
     * Indicates whether or not this handler is a decorator. A handler is a decorator
     * if its action function includes the name '$next' as a formal parameter. See
     * Handler#execute for more information execution differences between decorators
     * and non-decorators.
     */
    isDecorator: boolean;


    /**
     * Executes the rule. There are two modes of execution depending on whether or not
     * the rule is a decorator:
     * (1) A decorator has control over downstream execution. Its handler's $next' parameter
     * is bound to the `executeDownstreamHandlers` callback passed to `execute`. A decorator
     * may perform arbitrary steps before downstream execution, including modifying the
     * request. It may also perform arbitrary steps after downstream execution, including
     * modifying the response.
     * (2) A non-decorator rule always perform downstream execution first, and then only
     * executes its handler if the downsteam handlers did not produce a response.
     * @param {Request} request - an object containing all information relevant to producing
     *        a response, including the address from which capture name/value pairs are bound
     *        to handler function parameters.
     * @param {(request?: Request) => Response} executeDownstreamHandlers - a callback that
     *        executes all downsteam handlers and returns their collective response. The
     *        callback is already bound to the current request, and passes it to downstream
     *        handlers if invoked with no argument. A modified or alternative request may be
     *        passed to downstream handlers by passing it to this callback.
     * @returns {Response} - the response object returned by the handler. The handler may
     *        return null to indicate that it declined to produce a response. Processing
     *        proceeds upstream until a handler responds are all decorators have run.
     */
    execute: (request: Request, downstream: (request: Request) => Response) => Response;


    /** Returns a textual representation of this Rule instance. */
    toString() { return `'${this.pattern}': ${this.handler}`; }
}
