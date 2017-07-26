import {Handler as ExpressHandler, Request, Response} from 'express';
import * as multimethods from 'multimethods';
import * as url from 'url';
import Router from '../router';
// import PERMISSIONS_TAG from './permissions-tag';





// TODO: doc...
export default function crateRouterMiddleware() {

    // Create an express-style middleware function that internally delegates to a multimethod.
    let expressHandler: ExpressHandler = async (req, res, next) => {
        try {
            const result = await multimethod(req, res);
            if (result === false) {
                next(); // UNHANDLED
            }
        }
        catch (err) {
            next(err);
        }
    };

    // The middleware instance closes over these two variables.
    let router: Router;
    let multimethod: (req: Request, res: Response) => false | void | Promise<false | void>;

    // Add a getter/setter pair for the `router` property.
    const routerKey: keyof RouterMiddleware = 'router';
    Object.defineProperty(expressHandler, routerKey, {
        get() {
            return router;
        },
        set(value: Router) {
            router = value;

            multimethod = multimethods.create<Request, Response, false|void>({
                arity: 2,
                async: undefined,
                toDiscriminant: (req) => `${req.method} ${url.parse(req.url).pathname || ''}`,
                methods: router,
            });
        },
    });

    // Set the initial value for router, and return the middleware.
    let middleware = expressHandler as RouterMiddleware;
    middleware.router = new Router();
    return middleware;
}





export interface RouterMiddleware extends ExpressHandler {
    router: Router;
}





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
