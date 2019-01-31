import {RequestHandler} from 'express';
import debug from '../../util/debug';
import {ApplicationConfig} from '../application/application-options';
import createMiddleware from './create-middleware';





export default function createRequestLoggerMiddleware(config: ApplicationConfig): RequestHandler {
    return createMiddleware(async req => {
        // TODO: temp testing... better format/info?
        const user = req.user === null ? 'GUEST' : req.user;
        debug(`INCOMING REQUEST:\tUSER=${user}\tINTENT=${req.intent}`);
        return false;
    }, config);
}
