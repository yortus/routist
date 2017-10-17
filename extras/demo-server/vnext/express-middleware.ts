import {Request, RequestHandler, Response} from 'express';
import * as multimethods from 'multimethods';
import * as url from 'url';
import debug from '../../../src/util/debug';





export function createRouteTable() {

    let middleware = createMiddlewareFunction();

    let routes = {} as RouteTable;

    let proxy = new Proxy(middleware, {
        get: (_, propKey) => {
            if (propKey === 'length') return middleware.length;
            return routes[propKey];
        },
        set: (_, propKey, value) => {
            if (propKey === 'length') return false;
            debug(`Updated route '${propKey}'`);
            routes[propKey] = value;
            middleware.updateRoutes(routes);
            return true;
        },
    });

    return proxy as any as RequestHandler & RouteTable;
}





export interface RouteTable {
    [pattern: string]: Handler;
}
export type Handler = (req: Request, res: Response) => Promise<any>;





interface Middleware extends RequestHandler {
    updateRoutes(value: RouteTable): void;
}





function createMiddlewareFunction(): Middleware {

    function renewDispatchFunction(routes: RouteTable) {
        return multimethods.create<Request, Response, void>({
            arity: 2,
            async: true,
            toDiscriminant: req => `${req.method === 'GET' ? 'EXPR' : `STMT`} ${url.parse(req.url).pathname || ''}`,
            methods: routes,
        });
    }

    let mm = renewDispatchFunction({});

    let result = (async (req, res, next) => {

        // TODO: log request...
        debug(`HTTP Request: ${req.method} ${req.url}`);

        // TODO: dispatch through multimethod...
        try {
            await mm(req, res);
        }
        catch (err) {
            next(err);
        }
    }) as Middleware;

    result.updateRoutes = value => {
        mm = renewDispatchFunction(value);
    };

    return result;
}
