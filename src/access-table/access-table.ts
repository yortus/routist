import * as multimethods from 'multimethods';
import GUEST from '../guest';
import debug from '../util/debug';
import AccessContext from './access-context';
import AccessRule from './access-rule';





/**
 * Represents a rule-based access control system. An AccessTable holds an extendable set of
 * access rules. Each rule determines whether access is granted or denied based on programmable
 * criteria. The criteria may be as simple as _always grant_ or _always deny_, or an arbitrarily
 * complex function of the user and resource. Each rule in the table is qualified by a glob-like
 * pattern that matches some set of resources, so that for any particular access request, the
 * rule applied is the one that best matches the requested resource.
 */
export default class AccessTable {

    /** The current set of rules comprising this access table. */
    readonly rules = {} as {readonly [resourceQualifier: string]: AccessRule};

    /**
     * Adds new rules to the set of rules comprising this access table. The new rules are
     * integrated in a deterministic manner where (a) the order in which rules are added
     * does not matter; (b) duplicate resource qualifiers are not permitted; and (c) rule
     * selection is on the basis of the best-matching resource qualifier in each case.
     * @param newRules The new rules to be added. Each key-value pair represents one rule.
     * For each rule, the key is a resource qualifier written as a glob-like pattern, and
     * the value is a function taking a user and a resource, and returning 'grant', 'deny'
     * or 'pass'. The function may be either synchronous or asynchonous (ie promise-returning).
     * If a rule returns 'pass', then the access table will try the next-best-matching rule.
     */
    extend(newRules: {[resourceQualifier: string]: AccessRule}): AccessTable {

        // Get a reference (*not* a copy) to `this.rules` that we can assign new properties to.
        let rules = this.rules as {[resourceQualifier: string]: AccessRule};

        // Check and add each new rule one-by-one.
        Object.keys(newRules).forEach(newResourceQualifier => {
            debug(`SET ACCESS FOR: ${newResourceQualifier}`); // TODO: temp testing... improve message

            // Don't allow existing rules to be inadvertently overwritten.
            // TODO: provide an intentional syntax for explicitly overwriting/extending rules
            if (rules.hasOwnProperty(newResourceQualifier)) {
                throw new Error(`Access rule already set for '${newResourceQualifier}'`);
            }

            // Add the new rule.
            rules[newResourceQualifier] = newRules[newResourceQualifier];
        });

        // Update the multimethod to incorporate the extended set of rules.
        this._mm = buildMultimethodFromRules(rules);
        return this;
    }

    /**
     * Determines whether or not access is granted for the given user and resource
     * according to the current set of rules in this access table.
     * @param user the user seeking access.
     * @param resource the resource to which access is being sought.
     */
    async query(user: string | GUEST, resource: string) {
        try {
            // Delegate to the multimethod.
            let result = await this._mm(user, resource);
            if (result === 'grant') return true;
            if (result === 'deny') return false;
            throw new Error(`Expected 'grant' or 'deny' from access rules but got '${result}'`); // Sanity check
        }
        catch (err) {
            // There are two ways to get here:
            // 1. An access rule in the table threw an exception
            // 2. Every applicable access rule returned 'pass'

            // TODO: what is the expected behaviour? Provide an option in the constructor so client can specify.
            //       for now, we'll log the error and re-throw the exception.
            debug(`AccessTable query failed. ${err}`);
            throw err;
        }
    }

    // TODO: add toString() to pretty-print all the AccessTable's rules...

    private _mm = buildMultimethodFromRules({});
}





/** Private helper function */
function buildMultimethodFromRules(rules: {[resourceQualifier: string]: AccessRule}) {

    // Wrap every rule's handler to convert arguments and to handle 'pass' returns.
    const methods = Object.keys(rules).reduce(
        (meths, resourceQualifier) => {
            meths[resourceQualifier] = async (user, resource, captures) => {
                let context: AccessContext = {user, path: resource, params: captures};
                let result = await rules[resourceQualifier](user, context);
                return result === 'pass' ? multimethods.CONTINUE : result;
            };
            return meths;
        },
        {} as {[x: string]: (user: string | GUEST, resource: string, captures: any) => Promise<'grant' | 'deny'>}
    );

    // TODO: temp testing...
    return multimethods.create<string | GUEST, string, 'grant' | 'deny'>({
        arity: 2,
        async: true,
        methods,
        toDiscriminant: (_, resource) => resource,
    });
}
