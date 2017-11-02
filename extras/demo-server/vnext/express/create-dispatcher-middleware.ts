import {Request, RequestHandler, Response} from 'express';
import * as multimethods from 'multimethods';





export interface AccessControls {
    routes: { [filter: string]: Handler };
}
export interface Handler {
    (req: Request, res: Response): void | Promise<void>;
}





export default function createDispatcherMiddleware(): RequestHandler & AccessControls {

    // TODO: ACL hash...
    let routes = {} as { [filter: string]: Handler };

    // TODO: MM...
    let mm = compileDispatcher(routes);

    // TODO: Express middleware function...
    let middleware: RequestHandler = async (req, res) => {
        await mm(req, res);
    };

    // TODO: combine...
    let result = middleware as RequestHandler & AccessControls;
    result.routes = routes;
    return result;
}





function compileDispatcher(access: { [filter: string]: Handler }) {

    // TODO: temp testing...
    access = access;
    return multimethods.create<Request, Response, void>({
        arity: 2,
        async: true,
    });
}
