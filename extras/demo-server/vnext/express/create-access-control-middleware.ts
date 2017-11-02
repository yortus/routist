import {Request, RequestHandler} from 'express';
import * as multimethods from 'multimethods';
import {AccessGuard, GRANT, DENY} from '../access-guards';





export interface AccessControls {
    access: { [filter: string]: AccessGuard };
}





export default function createAccessControlMiddleware(): RequestHandler & AccessControls {

    // TODO: ACL hash...
    let access = {} as { [filter: string]: AccessGuard };

    let accessProxy = new Proxy(access, { set: (_, key, value) => setRoute('q', key, value) });
    
    // TODO: MM...
    let mm = compileAccessControls(access);

    // TODO: Express middleware function...
    let middleware: RequestHandler = async (req, _, next) => {
        let ruling = await mm(req);
        if (isGranted(ruling)) {
            return next();
        }
        else {
            // TODO: improve error handling...
            return next(Error(`Not permitted:   user="${req.user}"   intent="${req.intent}"`));
        }
    };

    // TODO: combine...
    let result = middleware as RequestHandler & AccessControls;
    result.access = access;
    return result;
}





function isGranted(ruling: GRANT | DENY): ruling is GRANT {
    return ruling === GRANT;
}




function compileAccessControls(access: { [filter: string]: AccessGuard }) {

    // TODO: temp testing...
    access = access;
    return multimethods.create<Request, GRANT | DENY>({
        arity: 1,
        async: true,
    });
}
