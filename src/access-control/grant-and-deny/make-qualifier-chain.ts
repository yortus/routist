import AccessGuard from '../access-guard';
import AccessPredicate from './access-predicate';
import ChainState from './chain-state';
import makeAccessGuard from './make-access-guard';





export default function makeQualifierChain(deriveState: (predicate: AccessPredicate) => ChainState) {

    let result: QualifierChain = (predicate: AccessPredicate) => {

        // Derive a chain state from the given predicate using the supplied function.
        let state = deriveState(predicate);

        // Make an access guard function based on the new chain state.
        let accessGuard = makeAccessGuard(state);

        // Form a chain by augmenting the access guard with recursive and/or/else chain continuations.
        return Object.assign(
            accessGuard,
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
                    fallback: makeAccessGuard({
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





export type QualifierChain = (predicate: AccessPredicate) => AccessGuard & {
    and: QualifierChain;
    or: QualifierChain;
    else: {
        fallback: AccessGuard;
    }
};
