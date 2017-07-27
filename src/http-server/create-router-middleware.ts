import {Handler as ExpressHandler} from 'express';
import * as multimethods from 'multimethods';
import * as url from 'url';
import Message, {createHttpMessage} from '../message';
import Router, {HandlerResult} from '../router';





// TODO: doc...
export default function createRouterMiddleware() {

    // Create an express-style middleware function that internally delegates to a multimethod.
    let expressHandler: ExpressHandler = async (request, response, next) => {
        try {
            // Compose a http message
            let message = createHttpMessage(request, response);
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

    // The middleware instance closes over these two variables.
    let router: Router;
    let multimethod: (msg: Message) => HandlerResult;

    // Add a getter/setter pair for the `router` property.
    const routerPropKey: keyof RouterMiddleware = 'router';
    Object.defineProperty(expressHandler, routerPropKey, {
        get() {
            return router;
        },
        set(value: Router) {
            router = value;
            multimethod = multimethods.create<Message, false|void>({
                arity: 1,
                async: undefined,
                toDiscriminant: msg => `${msg.request.method} ${url.parse(msg.request.url).pathname || ''}`,
                methods: router,
            });
        },
    });

    // Set the initial value for router, and return the middleware.
    let middleware = expressHandler as RouterMiddleware;
    middleware.router = new Router();
    return middleware;
}





export type RouterMiddleware = ExpressHandler & {router: Router};





// TODO: was... remove?
//     add<T extends {[K in keyof T]: Handler}>(newRoutes: T) {

//         // Ensure no clashing keys.
//         Object.keys(newRoutes).forEach(key => {
//             if (this.allRoutes.hasOwnProperty(key)) {
//                 throw new Error(`Duplicate route pattern '${key}'`);
//             }
//         });





// // TODO: temp testing...
// let permissions = (<any> newRoutes)[PERMISSIONS_TAG];
// if (permissions !== undefined) {

//     console.log('========== PERMISSIONS ==========');
//     console.log(permissions);

// }

//         // Merge new routes into `allRoutes`.
// // TODO: take permissions into account... how to merge them?
//         this.allRoutes = Object.assign(this.allRoutes, newRoutes);

//         // Update the multimethod. Actually creates a new one.
//         let mm = multimethods.create({
//             arity: 2,
//             async: undefined,
//             toDiscriminant: (req) => `${req.method} ${url.parse(req.url).pathname || ''}`,
//             methods: this.allRoutes,
//         });
//         this.mm = mm;
//     }

//     private mm: (req: Request, res: Response) => false | void | Promise<false | void>;

//     private allRoutes: {[pattern: string]: Handler};
// }
// interface MultimethodsMiddleware {
//     (req: Request, res: Response, next: NextFunction): false | void | Promise<false | void>;
// }
// export default MultimethodsMiddleware;
