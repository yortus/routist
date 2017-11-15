import {RequestHandler, Response} from 'express';
import * as multimethods from 'multimethods';
import {DispatchTable, Handler} from '../../dispatch';
import debug from '../../util/debug';
import createMiddleware, {AugmentedRequest} from './create-middleware';





export default function createDispatcherMiddleware() {

    // TODO: ACL hash...
    let routes = {} as { [filter: string]: Handler };

    let routesProxy = new Proxy(routes, {
        set: (_, key, value) => {
            debug(`SET HANDLER FOR: ${key}`); // TODO: temp testing...
            routes[key] = value; // TODO: make immutable...
            mm = compileDispatcher(routes); // TODO: batch updates... too costly to recompile on every key change
            return true;
        },
    });

    // TODO: MM...
    let mm = compileDispatcher(routes);

    // TODO: Express middleware function...
    let middleware = createMiddleware(async (req, res) => {
        let msg = await mm(req, res);
        if (msg !== undefined) {
            // TODO: handle non-undefined results...
        }
        return true; // TODO: allow special return value to 'pass through' to non-routist middleware
    });

    // TODO: combine...
    let result = middleware as RequestHandler & { routes: DispatchTable };
    result.routes = routesProxy;
    return result;
}





function compileDispatcher(routes: { [filter: string]: Handler }) {

    // TODO: wrap every handler to set req._captures
    const methods = {} as {[x: string]: (req: AugmentedRequest, res: Response, captures: any) => void};
    Object.keys(routes).forEach(key => {
        methods[key] = (req, res, captures) => {
            req._captures = captures;
            return routes[key](req, res);
        };
    });

    // TODO: temp testing...
    return multimethods.create<AugmentedRequest, Response, void>({
        arity: 2,
        async: undefined,
        methods,
        toDiscriminant: req => req.intent,
    });
}
