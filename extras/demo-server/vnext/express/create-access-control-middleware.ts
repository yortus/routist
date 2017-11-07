import {Request, RequestHandler} from 'express';
import * as multimethods from 'multimethods';
import {AccessGuard, DENY, GRANT} from '../access-guards';
import debug from '../debug';
import GUEST from '../guest';





export interface AccessControls {
    access: { [filter: string]: AccessGuard };
}





export default function createAccessControlMiddleware(): RequestHandler & AccessControls {

    // TODO: ACL hash...
    let access = {} as { [filter: string]: AccessGuard };

    let accessProxy = new Proxy(access, {
        set: (_, key, value) => {
            debug(`SET ACCESS FOR: ${key}`); // TODO: temp testing...
            access[key] = value; // TODO: make immutable...
            mm = compileAccessControls(access); // TODO: batch updates... too costly to recompile on every key change
            return true;
        },
    });

    // TODO: MM...
    let mm = compileAccessControls(access);

    // TODO: Express middleware function...
    let middleware: RequestHandler = async (req, res, next) => {
        let ruling = await mm(req);
        if (isGranted(ruling)) {
            return next();
        }

        // TODO: improve error handling...
        res.status(403);
        res.send(`Not permitted:   user="${req.user === GUEST ? 'GUEST' : req.user}"   intent="${req.intent}"`);
    };

    // TODO: combine...
    let result = middleware as RequestHandler & AccessControls;
    result.access = accessProxy;
    return result;
}





function isGranted(ruling: GRANT|DENY): ruling is GRANT {
    return ruling === GRANT;
}




function compileAccessControls(access: { [filter: string]: AccessGuard }) {

    // TODO: wrap every handler to set req._captures
    const methods = {} as {[x: string]: (req: Request, captures: any) => GRANT|DENY|Promise<GRANT|DENY>};
    Object.keys(access).forEach(key => {
        methods[key] = (req, captures) => {
            req._captures = captures;
            return access[key](req);
        };
    });

    // TODO: temp testing...
    return multimethods.create<Request, GRANT|DENY>({
        arity: 1,
        async: undefined,
        methods,
        toDiscriminant: req => req.intent,
    });
}
