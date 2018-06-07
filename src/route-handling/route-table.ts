import RouteHandler from './route-handler';





// TODO: rename intentFilter...
export default interface RouteTable {
    [pathQualifier: string]: RouteHandler;
}
