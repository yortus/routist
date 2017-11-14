import {NextFunction, Request, Response} from 'express';
import debug from '../../util/debug';





export default function handleErrors(err: any, _: Request, res: Response, __: NextFunction) {

    // TODO: temp testing... better format/info?
    debug(`REQUEST ERROR: ${err}`);

    // Set the response status and message
    // TODO: don't leak server details... How to whitelist error messages?
    let status = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    res.status(status).send(message);
}
