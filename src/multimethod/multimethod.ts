import makeRuleSetHandler from './make-rule-set-handler';
import Rule from './rule';
import MultimethodOptions from './multimethod-options';
// TODO: write up [1] ref below: resolving ambiguous pattern order (overlaps and tiebreak fn)
// TODO: finish options: MultimethodOptions implementation...



/**
 * A rule set provides a deterministic means to generate an appropriate response for a given address and request,
 * according to the list of rules passed to the constructor. The rule list passed to the constructor is unordered, with
 * each rule consisting of a pattern and a handler. For each rule, the pattern specifies the set of addresses that it
 * accepts, and optionally captures some substrings from the address. The corresponding handler generates a response
 * from a request, using the substrings captured by the pattern, if any. Handlers may also be 'decorators'. A decorator
 * is a handler function with a `$next` formal parameter. These are treated specially in the response-generation
 * process, as described below.
 *
 * The process of generating a response for a given address/request may be outlined as follows:
 * (1) The rule set's `execute` method is called with an address and a request.
 * (2) A shortlist consisting of only those rules whose patterns match the address is generated.
 * (3) The rule shortlist is sorted by relative match strength, from most- to least-specific. Rule A is a more specific
 *     match than Rule B if A's pattern matches a subset of the addresses matched by B's pattern. No ambiguity is
 *     permitted in this ordering step [1].
 * (4) The handlers for each shortlisted rule are attempted in order. Returning `UNHANDLED` from a handler signifies
 *     that the handler declined to handle the request. In this case, the next handler is tried. The handlers are thus
 *     tried in order until one returns a non-UNHANDLED value, which is the response. Subsequent handlers are not tried.
 * (5) The previous step (4) differs when some of the handlers are decorators. A decorator is always executed *before*
 *     its more specific handlers. The more-specific handlers are aggregated into a collective 'downstream' handler, and
 *     passed to the decorator via its `$next` parameter. A decorator may thus control the downstream handling process
 *     in many ways. It may execute logic before and/or after executing the downstream handlers. It may decline to
 *     execute the downstream handlers altogether, thus acting as a filter. It may send a modified request to the
 *     downstream handlers, and/or it may modify the response of the downstream handlers before returning it.
 *
 * NB: Requests and responses are treated as opaque values by the RuleSet class, which requires no knowledge of their
 *     internal structure to perform its function.
 *
 */
class Multimethod<TRequest extends any, TResponse extends any> {


    // TODO: doc...
    constructor(options: MultimethodOptions, rules: {[pattern: string]: Function}) {
        // TODO: where is best place to normalize options?
        options = options || {};
        options.getDiscriminant = options.getDiscriminant || (req => req ? req.toString() : '');

        let result = makeRuleSetHandler(options, rules);
        Multimethod.instances.add(result);
        return <any> result; // TODO: doc... must cast to account for _tag
    }


    // TODO: doc...
    static [Symbol.hasInstance](value: any) {
        return Multimethod.instances.has(value);
    }


    // TODO: doc...
    private static instances = new WeakSet();


    // TODO: doc...
    private _tag;
}
interface Multimethod<TRequest extends any, TResponse extends any> {
    (request: TRequest): TResponse | PromiseLike<TResponse>;
}
export default Multimethod;










// class RuleSet<TRequest extends any, TResponse extends any> {


//     /**
//      * Constructs a RuleSet instance from the given hash of pattern/handler pairs.
//      * @param {Object} rules - an associative array whose keys are pattern sources
//      *        and whose values are the corresponding handlers.
//      */
//     constructor(rules: {[pattern: string]: Function}/*, options?: MultimethodOptions*/) {

//         // TODO: process options...


//         this.execute = <any> makeRuleSetHandler(rules);
//     }


//     /**
//      * Generates the appropriate response for the given address and request, according to the rules with which this
//      * RuleSet was constructed. The response may be generated asynchronously, in which case the return value will be a
//      * promise of the response.
//      * @param {string} address - the address associated with the incoming request, used to determine which rule handlers
//      *        to apply to this request.
//      * @param {TRequest} request - the request for which a response is to be generated.
//      * @returns {TResponse|PromiseLike<TResponse>} the response generated for the given address/request according to the
//      *        rules with which this RuleSet was constructed. It may be a promise.
//      */
//     execute: (request: TRequest) => TResponse | PromiseLike<TResponse>;
// }
