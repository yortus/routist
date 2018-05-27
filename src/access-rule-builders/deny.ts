import makeAccessRule from './make-access-rule';
import makeQualifierChain from './make-qualifier-chain';

// TS4082/TS6133 workaraound
import {AccessContext} from '../access-table';
import GUEST from '../guest';
export {AccessContext, GUEST};





// TODO: explain further...
/**
 * Builds an access rule that denies access.
 */
const deny = {
    access: Object.assign(
        makeAccessRule({
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
export default deny;
