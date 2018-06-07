import {Request as ExpressRequest, RequestHandler as ExpressRequestHandler} from 'express';
import {HttpError} from 'httperr';
import * as url from 'url';
import GUEST from '../../guest';
import {default as RoutistRequest} from '../../request';
import {default as RoutistResponse} from '../../response';
import debug from '../../util/debug';
import {ApplicationConfig} from '../application/application-options';





/** internal helper function used to create express middleware functions from routist handler functions. */
export default function createMiddleware(handler: RoutistRequestHandler, config: ApplicationConfig) {
    let result: ExpressRequestHandler = async (req, res, next) => {
        let reqx = augmentRequest(req, config);
        try {
            let handled = await handler(reqx, res);
            if (!handled) {
                return next();
            }
        }
        catch (err) {
            // TODO: temp testing... better format/info?
            debug(`REQUEST ERROR: ${err}`);

            // If the error is an HttpError, then respond to it. The permissions system uses this to respond with 403.
            // Client can also use it as a way to get routist to handle errors (ie send response) directly.
            // TODO: doc special case handling of HttpError instances - this is effectively part of the public API.
            if (err instanceof HttpError) {
                res.status(err.statusCode);
                res.send(err.message); // TODO: don't leak server details to client... how to ensure this reliably??
                return;
            }

            // In general, routist doesn't handle/respond on errors.The client application should do that for itself.
            next(err);
        }
    };
    return result;
}





// TODO: doc... eventual returned value: true=success; false=skipped; reject=failure
export type RoutistRequestHandler = (req: RoutistRequest, res: RoutistResponse) => Promise<boolean>;





// TODO: ...
function augmentRequest(expressRequest: ExpressRequest, config: ApplicationConfig) {

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
            get: (): string | GUEST => config.getUser(req),
            set: (value: string | GUEST) => config.setUser(req, value),
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
