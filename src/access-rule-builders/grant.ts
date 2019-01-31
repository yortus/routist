import makeAccessRule from './make-access-rule';
import makeQualifierChain from './make-qualifier-chain';

// TS4082/TS6133 workaraound
import {AccessContext} from '../access-table';
export {AccessContext};





// TODO: explain further...
/**
 * Builds an access rule that grants access.
 */
const grant = {
    access: Object.assign(
        makeAccessRule({
            test: () => true,
            consequent: 'grant',
            alternate: 'pass',
        }),
        {
            when: makeQualifierChain(predicate => ({
                test: predicate,
                consequent: 'grant',
                alternate: 'pass',
            })),
        }
    ),
};
export default grant;
