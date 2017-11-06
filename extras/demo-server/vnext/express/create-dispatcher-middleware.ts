import {Request, RequestHandler, Response} from 'express';
import * as multimethods from 'multimethods';
import debug from '../debug';





export interface DispatchTable {
    routes: { [filter: string]: Handler };
}
export interface Handler {
    (req: Request, res: Response): void | Promise<void>;
}





export default function createDispatcherMiddleware(): RequestHandler & DispatchTable {

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
    let middleware: RequestHandler = async (req, res) => {
        let result = await mm(req, res);
        if (result !== undefined) {
            // TODO: handle non-undefined results...
        }
    };

    // TODO: combine...
    let result = middleware as RequestHandler & DispatchTable;
    result.routes = routesProxy;
    return result;
}





function compileDispatcher(routes: { [filter: string]: Handler }) {

    // TODO: temp testing...
    return multimethods.create<Request, Response, void>({
        arity: 2,
        async: undefined,
        methods: routes,
        toDiscriminant: req => req.intent,
    });
}
