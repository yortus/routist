// TODO: remove...
// tslint:disable:no-console





import {declarationsFor} from '../access-control';
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



class Router {

    constructor() {
        // TODO: ...
        // use property decorator info... (permissions)
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        let declarations = declarationsFor(Object.getPrototypeOf(this));
        declarations.forEach(decl => {
            console.log(decl);
        });
    }
}
export default Router;





// TODO: temp testing...
interface Router {
    [pattern: string]: Handler | Handler[];
}
