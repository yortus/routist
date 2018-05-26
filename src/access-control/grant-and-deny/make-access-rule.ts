import AccessRule from '../access-rule';
import ChainState from './chain-state';





export default function makeAccessRule(state: ChainState): AccessRule {
    return async req => {
        let testResult = await state.test(req);
        return testResult ? state.consequent : state.alternate;
    };
}
