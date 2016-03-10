'use strict';
import * as assert from 'assert';
import {getFunctionParameterNames} from '../util';
import Pattern from '../pattern';





/**
 * A Rule consists of a pattern and a handler, and represents a single element in a rule set.
 * See the RuleSet documentation for additional information.
 */
export default class Rule {


    /**
     * Constructs a Rule instance.
     * @param {string} patternSource - The source string for the pattern recognised by this rule.
     * @param {Function} handler - a function providing processing logic for producing a reponse from a given request.
     *        It may be invoked when the RuleSet containing this rule is executed against an address and request. Each
     *        of the `handler` function's formal parameter names must match either a capture name from the pattern, or
     *        a builtin name such as `$req` or `$next`. Capture values and/or builtin values are passed as the actual
     *        parameters to the `handler` function upon invocation. Any non-null return value from `handler` is
     *        interpreted as a response. A null return value signifies that the handler declined to respond to the given
     *        request, even if the pattern matched the request's address.
     */
    constructor(patternSource: string, handler: Function) {

        // Construct the pattern instance, and assign the pattern and handler properties.
        let pattern = this.pattern = new Pattern(patternSource); // NB: may throw
        this.handler = handler;

        // Get the handler function's formal parameter names.
        let paramNames = this.parameterNames = getFunctionParameterNames(handler);

        // Assert the mutual validity of `pattern` and `paramNames`. This catches some errors early, and allows
        // composite handling logic to be simpler, since it can safely forego the checks already made here.
        validateNames(pattern, paramNames); // NB: may throw

        // If the handler function has a formal parameter named '$next', that signifies this rule is a decorator.
        this.isDecorator = paramNames.indexOf('$next') !== -1;
    }


    /** The pattern associated with this Rule instance. */
    pattern: Pattern;


    /** The handler associated with this Rule instance, exactly as it was provided to the constructor. */
    handler: Function;


    /** The names of the handler function's formal parameters. */
    parameterNames: string[];


    /** Indicates whether the handler function represents a decorator. Decorators have a '$next' formal parameter */
    isDecorator: boolean;
}





/**
 * Lists the names of builtins with special meanings when the are used as formal parameter names in handler functions:
 * '$addr': injects the current address string into the handler function.
 * '$req': injects the current request object into the handler function.
 * '$next': marks the handler function as a decorator, and injects a composite
 *          handler for all 'downstream' rules into the decorator function.
 */
const builtinNames = ['$addr', '$req', '$next'];





/**
 * Asserts the mutual validity of a pattern's capture names with a handlers's formal parameter names:
 * - Every parameter name must match either a capture name or a builtin name.
 * - Every capture name in the pattern must also be present among the handler's parameter names.
 * - None of the pattern's capture names may match a builtin name.
 */
function validateNames(pattern: Pattern, paramNames: string[]) {
    let bnames = builtinNames;
    let pnames = paramNames;
    let cnames = pattern.captureNames;

    // We already know the capture names are valid JS identifiers. Now also ensure they don't clash with builtin names.
    let badCaptures = cnames.filter(cname => bnames.indexOf(cname) !== -1);
    let ok = badCaptures.length === 0;
    assert(ok, `Use of reserved name(s) '${badCaptures.join("', '")}' as capture(s) in pattern '${Pattern}'`);

    // Ensure that all capture names appear among the handler's parameter names (i.e. check for unused capture names).
    let excessCaptures = cnames.filter(cname => pnames.indexOf(cname) === -1);
    ok = excessCaptures.length === 0;
    assert(ok, `Capture name(s) '${excessCaptures.join("', '")}' unused by handler in pattern '${pattern}'`);

    // Ensure every parameter name matches either a capture name or a builtin name (i.e. check for unsatisfied params).
    let excessParams = pnames.filter(pname => bnames.indexOf(pname) === -1 && cnames.indexOf(pname) === -1);
    ok = excessParams.length === 0;
    assert(ok, `Handler parameter(s) '${excessParams.join("', '")}' not captured by pattern '${pattern}'`);
}
