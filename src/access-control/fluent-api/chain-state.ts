import Permission from '../permission';
import AccessPredicate from './access-predicate';





export default interface ChainState {
    test: AccessPredicate;
    consequent: Permission;
    alternate: Permission;
}
