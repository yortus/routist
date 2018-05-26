import AccessGuard from './access-guard';





export default interface AccessTable {
    [intentFilter: string]: AccessGuard;
}
