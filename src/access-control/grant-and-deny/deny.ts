import makeAccessGuard from './make-access-guard';
import makeQualifierChain from './make-qualifier-chain';

// TS4082/TS6133 workaraound
import Request from '../../request';
import {QualifierChain} from './make-qualifier-chain';
export {Request, QualifierChain};





// TODO: explain...
export default {
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
