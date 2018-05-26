import AccessRule from './access-rule';





export default interface AccessTable {
    [pathQualifier: string]: AccessRule;
}
