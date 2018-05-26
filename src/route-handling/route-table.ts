import RouteHandler from './route-handler';





// TODO: rename intentFilter...
export default interface RouteTable {
    [intentFilter: string]: RouteHandler;
}
