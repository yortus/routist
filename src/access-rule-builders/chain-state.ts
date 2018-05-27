import RuleQualifier from './rule-qualifier';





export default interface ChainState {
    test: RuleQualifier;
    consequent: 'grant' | 'deny' | 'pass';
    alternate: 'grant' | 'deny' | 'pass';
}
