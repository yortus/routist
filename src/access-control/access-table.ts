import AccessRule from './access-rule';





export default interface AccessTable {
    [pattern: string]: AccessRule;
}
