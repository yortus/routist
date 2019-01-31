import makeAccessRule from './make-access-rule';
import makeQualifierChain from './make-qualifier-chain';

// TS4082/TS6133 workaraound
import {AccessContext} from '../access-table';
export {AccessContext};





// TODO: explain further...
/**
 * Builds an access rule that denies access.
 */
const deny = {
    access: Object.assign(
        makeAccessRule({
            test: () => true,
            consequent: 'deny',
            alternate: 'pass',
        }),
        {
            when: makeQualifierChain(predicate => ({
                test: predicate,
                consequent: 'deny',
                alternate: 'pass',
            })),
        }
    ),
};
export default deny;
