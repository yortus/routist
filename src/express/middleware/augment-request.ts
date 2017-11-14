import * as assert from 'assert';
import {NextFunction, Request, Response} from 'express';
import * as url from 'url';
import {GUEST, User} from '../../authentication';





// TODO: ...
// tslint:disable-next-line:no-namespace
declare global {
    export namespace Express {
        // tslint:disable-next-line:no-shadowed-variable
        export interface Request {
            user: User;
            intent: string;
            fields: { [name: string]: {} };
            _captures: {[captureName: string]: string};
        }
    }
}





export default function augmentRequest(req: Request, _: Response, next: NextFunction) {

    // TODO: override the request method if the querystring has a 'method' parameter with a valid value.
    // TODO: move this into its own middleware / 3rd party middleware already existing?
    // TODO: whitelist is good, but could extend it...
    // TODO: audit effects of changing method - security, caching on intermediaries, etc
    // TODO: :::GOOD IDEA::: method-overriding only in 'dev' mode
    let method = (req.query.method as string || req.method).toUpperCase();
    if (['GET', 'POST', 'PUT', 'DELETE'].includes(method)) req.method = method;

    // TODO: add req properties: user, fields, intent...
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

    // Continue with next middleware function.
    next();
}
