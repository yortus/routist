import RouteHandler from './route-handler';





export default interface RouteTable {
    [intentFilter: string]: RouteHandler;
}
