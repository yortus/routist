import AccessGuard from '../access-guard';
import ChainState from './chain-state';





export default function makeAccessGuard(state: ChainState): AccessGuard {
    return async req => {
        let testResult = await state.test(req);
        return testResult ? state.consequent : state.alternate;
    };
}
