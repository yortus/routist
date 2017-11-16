import {Permission} from '../access-control-types';
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
