import makeAccessRule from './make-access-rule';
import makeQualifierChain from './make-qualifier-chain';

// TS4082/TS6133 workaraound
import Request from '../../request';
import AccessContext from '../access-context';
import {QualifierChain} from './make-qualifier-chain';
export {AccessContext, QualifierChain, Request};





// TODO: explain...
export default {
    access: Object.assign(
        makeAccessRule({
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
