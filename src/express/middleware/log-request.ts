import {NextFunction, Request, Response} from 'express';
import {GUEST} from '../../authentication';
import debug from '../../util/debug';





export default function logRequest(req: Request, _: Response, next: NextFunction) {

    // TODO: temp testing... better format/info?
    const user = req.user === GUEST ? 'GUEST' : req.user;
    debug(`INCOMING REQUEST:\tUSER=${user}\tINTENT=${req.intent}`);

    // Continue with next middleware function.
    next();
}
