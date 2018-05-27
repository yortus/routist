import {AccessRule} from '../access-table';
import ChainState from './chain-state';
import makeAccessRule from './make-access-rule';
import RuleQualifier from './rule-qualifier';





export default function makeQualifierChain(deriveState: (predicate: RuleQualifier) => ChainState) {

    let result: QualifierChain = (predicate: RuleQualifier) => {

        // Derive a chain state from the given predicate using the supplied function.
        let state = deriveState(predicate);

        // Make an access guard function based on the new chain state.
        let accessRule = makeAccessRule(state);

        // Form a chain by augmenting the access guard with recursive and/or/else chain continuations.
        return Object.assign(
            accessRule,
            {
                and: makeQualifierChain(andPredicate => ({
                    test: async (user, ctx) => (await state.test(user, ctx)) && (await andPredicate(user, ctx)),
                    consequent: state.consequent,
                    alternate: state.alternate,
                })),
                or: makeQualifierChain(orPredicate => ({
                    test: async (user, ctx) => (await state.test(user, ctx)) || (await orPredicate(user, ctx)),
                    consequent: state.consequent,
                    alternate: state.alternate,
                })),
                else: {
                    grant: makeAccessRule({
                        test: state.test,
                        consequent: state.consequent,
                        alternate: 'grant',
                    }),
                    deny: makeAccessRule({
                        test: state.test,
                        consequent: state.consequent,
                        alternate: 'deny',
                    }),
                },
            }
        );
    };
    return result;
}





export type QualifierChain = (predicate: RuleQualifier) => AccessRule & {
    and: QualifierChain;
    or: QualifierChain;
    else: {
        grant: AccessRule;
        deny: AccessRule;
    }
};
