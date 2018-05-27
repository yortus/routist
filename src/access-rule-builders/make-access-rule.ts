import {AccessRule} from '../access-table';
import ChainState from './chain-state';





export default function makeAccessRule(state: ChainState): AccessRule {
    return async (user, context) => {
        let testResult = await state.test(user, context);
        return testResult ? state.consequent : state.alternate;
    };
}
