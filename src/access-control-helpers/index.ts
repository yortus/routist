import Request from '../request';
import makeAccessGuard from './make-access-guard';
import makeQualifierChain, {QualifierChain} from './make-qualifier-chain';
export {QualifierChain, Request};





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
            consequent: 'grant',
            alternate: 'deny', // TODO: should this be 'pass'?
        }),
        {
            when: makeQualifierChain(predicate => ({
                test: predicate,
                consequent: 'grant',
                alternate: 'deny', // TODO: should this be 'pass'?
            })),
        }
    ),
};





// TODO: explain...
export const deny = {
    access: Object.assign(
        makeAccessGuard({
            test: () => true,
            consequent: 'deny',
            alternate: 'grant', // TODO: should this be 'pass'?
        }),
        {
            when: makeQualifierChain(predicate => ({
                test: predicate,
                consequent: 'deny',
                alternate: 'grant', // TODO: should this be 'pass'?
            })),
        }
    ),
};
