import AccessRule from '../access-rule';
import AccessPredicate from './access-predicate';
import ChainState from './chain-state';
import makeAccessRule from './make-access-rule';





export default function makeQualifierChain(deriveState: (predicate: AccessPredicate) => ChainState) {

    let result: QualifierChain = (predicate: AccessPredicate) => {

        // Derive a chain state from the given predicate using the supplied function.
        let state = deriveState(predicate);

        // Make an access guard function based on the new chain state.
        let accessRule = makeAccessRule(state);

        // Form a chain by augmenting the access guard with recursive and/or/else chain continuations.
        return Object.assign(
            accessRule,
            {
                and: makeQualifierChain(andPredicate => ({
                    test: async req => (await state.test(req)) && (await andPredicate(req)),
                    consequent: state.consequent,
                    alternate: state.alternate,
                })),
                or: makeQualifierChain(orPredicate => ({
                    test: async req => (await state.test(req)) || (await orPredicate(req)),
                    consequent: state.consequent,
                    alternate: state.alternate,
                })),
                else: {
                    fallback: makeAccessRule({
                        test: state.test,
                        consequent: state.consequent,
                        alternate: 'pass',
                    }),
                },
            }
        );
    };
    return result;
}





export type QualifierChain = (predicate: AccessPredicate) => AccessRule & {
    and: QualifierChain;
    or: QualifierChain;
    else: {
        fallback: AccessRule;
    }
};
