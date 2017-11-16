import {RequestHandler} from 'express';
import * as multimethods from 'multimethods';
import Request from '../../request';
import Response from '../../response';
import {RouteTable} from '../../route-dispatch-types';
import debug from '../../util/debug';
import createMiddleware from './create-middleware';





export default function createRouteDispatcherMiddleware() {

    // TODO: ...
    let routeTable = {} as RouteTable;
    let multimethod = compileRouteTable(routeTable);
    let multimethodUpdatePending = false;

    function updateMultimethod() {
        if (multimethodUpdatePending === true) return;
        multimethodUpdatePending = true;
        process.nextTick(() => {
            multimethod = compileRouteTable(routeTable);
            multimethodUpdatePending = false;
        });
    }

    let routeTableProxy = new Proxy(routeTable, {
        set: (_, key, value) => {
            // TODO: detect collisions... warn/error, provide intentional override system...
            debug(`SET HANDLER FOR: ${key}`); // TODO: temp testing...
            routeTable[key] = value; // TODO: make immutable...
            updateMultimethod();
            return true;
        },
    });

    // TODO: Express middleware function...
    let middleware = createMiddleware(async (req, res) => {
        try {
            let msg = await multimethod(req, res);
            if (msg !== undefined) {
                // TODO: handle non-undefined results... This could be useful for route handler helpers like JSON etc...
            }

            // Indicate that the request was handled.
            return true;
        }
        catch (err) {
            if (err.code && err.code === multimethods.UNHANDLED_DISPATCH) {
                // The multimethod dispatch went unhandled, so indicate the request is still unhandled...
                return false;
            }
            else {
                // Something else blew up inside the multimethod, so re-throw the error...
                throw err;
            }
        }
    });

    // TODO: combine...
    let result = middleware as RequestHandler & { routes: RouteTable };
    result.routes = routeTableProxy;
    return result;
}





function compileRouteTable(routes: RouteTable) {

    // TODO: wrap every handler to set req._captures
    const methods = {} as {[x: string]: (req: Request, res: Response, captures: any) => void};
    Object.keys(routes).forEach(key => {
        methods[key] = (req, res, captures) => {
            req._captures = captures;
            return routes[key](req, res);
        };
    });

    // TODO: temp testing...
    return multimethods.create<Request, Response, void>({
        arity: 2,
        async: undefined,
        methods,
        toDiscriminant: req => req.intent,
    });
}
