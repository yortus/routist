import Handler from './handler';





export default interface DispatchTable {
    [intentFilter: string]: Handler;
}
