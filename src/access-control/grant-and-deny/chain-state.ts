import AccessPredicate from './access-predicate';





export default interface ChainState {
    test: AccessPredicate;
    consequent: 'grant' | 'deny' | 'pass'; // TODO: need 'pass' here?
    alternate: 'grant' | 'deny' | 'pass'; // TODO: need 'pass' here?
}
