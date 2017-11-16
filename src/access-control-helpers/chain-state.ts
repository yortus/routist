import {Permission} from '../access-control-types';
import AccessPredicate from './access-predicate';





export default interface ChainState {
    test: AccessPredicate;
    consequent: Permission;
    alternate: Permission;
}
