import * as assert from 'assert';
import {Request as ExpressRequest, RequestHandler as ExpressRequestHandler} from 'express';
import {HttpError} from 'httperr';
import * as url from 'url';
import {GUEST, User} from '../../identity-types';
import {default as RoutistRequest} from '../../request';
import {default as RoutistResponse} from '../../response';
import debug from '../../util/debug';





// TODO: ...
export default function createMiddleware(handler: RoutistRequestHandler): ExpressRequestHandler {
    return async (req, res, next) => {
        let reqx = augmentRequest(req);
        try {
            let handled = await handler(reqx, res);
            if (!handled) {
                return next();
            }
        }
        catch (err) {
            // TODO: temp testing... better format/info?
            debug(`REQUEST ERROR: ${err}`);

            if (err instanceof HttpError) {
                res.status(err.statusCode);
                res.send(err.message); // TODO: don't leak server details to client... how to ensure this reliably??
            }
            else {
                res.status(500).send('Internal server error');
            }
        }
    };
}





// TODO: doc... eventual returned value: true=success; false=skipped; reject=failure
export type RoutistRequestHandler = (req: RoutistRequest, res: RoutistResponse) => Promise<boolean>;





// TODO: ...
function augmentRequest(expressRequest: ExpressRequest) {

    // Return early if the request is already augmented.
    let req = expressRequest as RoutistRequest;
    if (req.intent) return req;

    // TODO: override the request method if the querystring has a 'method' parameter with a valid value.
    // TODO: move this into its own middleware / 3rd party middleware already existing?
    // TODO: whitelist is good, but could extend it...
    // TODO: audit effects of changing method - security, caching on intermediaries, etc
    // TODO: :::GOOD IDEA::: method-overriding only in 'dev' mode
    let method = (req.query.method as string || req.method).toUpperCase();
    if (['GET', 'POST', 'PUT', 'DELETE'].includes(method)) req.method = method;

    // TODO: add req properties: user, fields, intent...
    // TODO: how to ensure sync with RoutistRequest interface?
    Object.defineProperties(req, {
        user: {
            get: (): User => {
                assert(req.session, 'Internal error: request contains no session property.');
                return req.session!.user || GUEST;
            },
            set: (value: User) => {
                assert(req.session, 'Internal error: request contains no session property.');
                req.session!.user = value;
            },
            enumerable: true,
        },
        fields: {
            // TODO: cache this after first compute? But captures will change per handler... how to do it?
            get: () => Object.assign({}, req.query, req.body, req._captures),
            enumerable: true,
        },
        intent: {
            get: () => {
                // TODO: cache this after first compute...
                let resource = url.parse(req.url).pathname || '';
                return `${req.method} ${resource}`;
            },
            enumerable: true,
        },
    });
    return req;
}