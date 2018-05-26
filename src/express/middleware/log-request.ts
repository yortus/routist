import {RequestHandler} from 'express';
import GUEST from '../../guest';
import debug from '../../util/debug';
import createMiddleware from './create-middleware';





const logRequest: RequestHandler = createMiddleware(async req => {
    // TODO: temp testing... better format/info?
    const user = req.user === GUEST ? 'GUEST' : req.user;
    debug(`INCOMING REQUEST:\tUSER=${user}\tINTENT=${req.intent}`);
    return false;
});
export default logRequest;
