import {RequestHandler} from 'express';
import {Multimethod, next} from 'multimethods';
import Request from '../../request';
import Response from '../../response';
import {RouteTable} from '../../route-handling';
import debug from '../../util/debug';
import {ApplicationConfig} from '../application/application-options';
import createMiddleware from './create-middleware';





export default function createRouteDispatcherMiddleware(config: ApplicationConfig) {

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
        set: (_, key: string, value) => {
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
            if (err === UNHANDLED) {
                // The multimethod dispatch went unhandled, so indicate the request is still unhandled...
                return false;
            }
            else {
                // Something else blew up inside the multimethod, so re-throw the error...
                throw err;
            }
        }
    }, config);

    // TODO: combine...
    let result = middleware as RequestHandler & { routes: RouteTable };
    result.routes = routeTableProxy;
    return result;
}





function compileRouteTable(routes: RouteTable) {

    // TODO: wrap every handler to set req._captures
    const methods = {} as {[x: string]: (bindings: unknown, req: Request, res: Response) => void};
    Object.keys(routes).forEach(key => {
        methods[key] = (bindings, req, res) => {
            req._captures = bindings as any;
            return routes[key](req, res);
        };
    });

    // TODO: temp testing...
    return Multimethod(async (req: Request, _res: Response) => req.intent)
        .extend(methods)
        .decorate({'**': throwOnUnhandled});
}




async function throwOnUnhandled(_: any, method: any, args: any[]) {
    let result = await method(...args);
    if (result === next) throw UNHANDLED;
    return result;
}




const UNHANDLED = new Error('Unhandled dispatch');
