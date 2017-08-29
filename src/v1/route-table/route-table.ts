import Handler from './handler';





// TODO: some extra routing should be added automatically... Add these to base class?
// 1. logRequest
// 2. servePublicAssets
// 3. ensureAuthorisedUser
// 4. ...?





// TODO: from http-server... add? remove this comment?
    /** Add routes to the HTTP server's route-handling multimethod. */
    // add<T extends {[K in keyof T]: Handler}>(newRoutes: T) {
    //     this.mm.add(newRoutes);
    // }



class RouteTable {

    constructor() {
        // TODO: ...
    }
}
export default RouteTable;





// TODO: temp testing...
interface RouteTable {
    [pattern: string]: Handler | Handler[];
}
