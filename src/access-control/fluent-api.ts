import Request from '../request';
import AccessGuard from './access-guard';
import Permission from './permission';





/*
    grant|deny access [when <cond>] [and|or <cond>...] [else fallback]
    \_______________/                                                   permission
                            \________________________________________/  qualifier chain (initiator)
                                            \________________________/  qualifier chain (conjunct)
                      \______________________________________________/  'when' qualifier
                                    \________________________________/  'and/or' qualifier
                                                       \_____________/  'else' qualifier
 */





// TODO: explain...
export const grant = {
    access: Object.assign(
        makeAccessGuard({
            test: () => true,
            consequent: Permission.GRANTED,
            alternate: Permission.DENIED,
        }),
        {
            when: makeQualifierChain(predicate => ({
                test: predicate,
                consequent: Permission.GRANTED,
                alternate: Permission.DENIED,
            })),
        }
    ),
};





// TODO: explain...
export const deny = {
    access: Object.assign(
        makeAccessGuard({
            test: () => true,
            consequent: Permission.DENIED,
            alternate: Permission.GRANTED,
        }),
        {
            when: makeQualifierChain(predicate => ({
                test: predicate,
                consequent: Permission.DENIED,
                alternate: Permission.GRANTED,
            })),
        }
    ),
};





interface ChainState {
    test: AccessPredicate;
    consequent: Permission;
    alternate: Permission;
}





function makeAccessGuard(state: ChainState): AccessGuard {
    return async req => {
        let testResult = await state.test(req);
        return testResult ? state.consequent : state.alternate;
    };
}





function makeQualifierChain(deriveState: (predicate: AccessPredicate) => ChainState) {

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
                        alternate: Permission.INHERITED,
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





export type AccessPredicate = (req: Request) => boolean | Promise<boolean>;
