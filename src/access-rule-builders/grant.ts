import makeAccessRule from './make-access-rule';
import makeQualifierChain from './make-qualifier-chain';

// TS4082/TS6133 workaraound
import {AccessContext} from '../access-table';
import GUEST from '../guest';
export {AccessContext, GUEST};





// TODO: explain further...
/**
 * Builds an access rule that grants access.
 */
const grant = {
    access: Object.assign(
        makeAccessRule({
            test: (_user: string | GUEST) => true,
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
export default grant;