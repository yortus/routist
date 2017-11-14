import {Request} from 'express';
import {AugmentedRequest} from '..';
import {GUEST} from '../../authentication';
import debug from '../../util/debug';





export default function logRequest(expressReq: Request, _: {}, next: Function) {

    // TODO: temp testing... better format/info?
    let req = expressReq as AugmentedRequest; // TODO: assumes request is already augmented. Make safer...
    const user = req.user === GUEST ? 'GUEST' : req.user;
    debug(`INCOMING REQUEST:\tUSER=${user}\tINTENT=${req.intent}`);

    // Continue with next middleware function.
    next();
}
