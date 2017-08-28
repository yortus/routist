import {Handler as ExpressHandler, NextFunction, Request, Response} from 'express';
import * as multimethods from 'multimethods';
import Message, {createHttpMessage} from '../../message';
import RouteTable, {HandlerResult} from '../../route-table';





// TODO: doc...
export default function createRouteTableMiddleware() {

    // The middleware function closes over this multimethod, which may be changed by the `update` method.
    let multimethod: (msg: Message) => HandlerResult = () => false;

    // Create an express-style middleware function that internally delegates to the multimethod.
    let expressHandler: ExpressHandler = async (req, res, next) => {
        try {
            // Compose a http message
            let message = createHttpMessage(req, res); // TODO: double work: ACL middleware also creates this
            const result = await multimethod(message);
            if (result === false) {
                next(); // SKIPPED
            }
        }
        catch (err) {
            next(err); // FAILURE
        }
        // SUCCESS
    };

    // Add the `update` method as a property of the middleware function object.
    let middleware = expressHandler as RouteTableMiddleware;
    middleware.update = routes => {
        multimethod = multimethods.create<Message, false|void>({
            arity: 1,
            async: undefined,
            toDiscriminant: msg => msg.discriminant,
            methods: routes, // TODO: any checking needed?
        });
    };

    // All done.
    return middleware;
}





// TODO: doc...
export interface RouteTableMiddleware {
    (req: Request, res: Response, next: NextFunction): any;
    update(routes: RouteTable): void;
}





// TODO: was... remove?
//     add<T extends {[K in keyof T]: Handler}>(newRoutes: T) {

//         // Ensure no clashing keys.
//         Object.keys(newRoutes).forEach(key => {
//             if (this.allRoutes.hasOwnProperty(key)) {
//                 throw new Error(`Duplicate route pattern '${key}'`);
//             }
//         });
