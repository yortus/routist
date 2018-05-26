import RuleQualifier from '../rule-qualifier';





export default interface ChainState {
    test: RuleQualifier;
    consequent: 'grant' | 'deny' | 'pass'; // TODO: need 'pass' here?
    alternate: 'grant' | 'deny' | 'pass'; // TODO: need 'pass' here?
}
