import {Handler as ExpressHandler, NextFunction, Request, Response} from 'express';
import {AccessControlList} from '../../access-control';
import Message, {createHttpMessage} from '../../message';
import RouteTable from '../../route-table';
import HttpConfiguration from '../http-configuration';





// TODO: doc...
export default function createAccessControlMiddleware(config: HttpConfiguration) {

    // The middleware function closes over this policy function, which may be changed by the `update` method.
    let policy: (msg: Message) => boolean;

    // Create an express-style middleware function that internally delegates to the policy function.
    let expressHandler: ExpressHandler = async (req, res, next) => {
        try {
            // Compose a http message
            let message = createHttpMessage(req, res); // TODO: double work: route table middleware also creates this
            const result = await policy(message);
            if (result === true) {
                // Policy is ALLOW; proceed to next handler
                next();
            } else {
                // Policy is DENY; return a 401 response to the HTTP client
                res.sendStatus(401);
            }
        }
        catch (err) {
            next(err); // FAILURE
        }
    };

    // Add the `update` method as a property of the middleware function object.
    let middleware = expressHandler as AccessControlMiddleware;
    middleware.update = routes => {
        let acl = AccessControlList.for(Object.getPrototypeOf(routes));
        policy = acl.toPolicy(config);
    };

    // All done.
    return middleware;
}





// TODO: doc...
export interface AccessControlMiddleware {
    (req: Request, res: Response, next: NextFunction): any;
    update(routes: RouteTable): void;
}
