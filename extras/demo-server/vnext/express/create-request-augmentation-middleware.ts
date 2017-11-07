import * as express from 'express';
import * as url from 'url';
import GUEST from '../guest';





// tslint:disable-next-line:no-namespace
declare global {
    export namespace Express {
        // tslint:disable-next-line:no-shadowed-variable
        export interface Request {
            user: string | typeof GUEST;
            fields: { [name: string]: {} };
            intent: string;
            _captures: {[captureName: string]: string};
        }
    }
}





export default function createRequestAugmentationMiddleware(): express.RequestHandler {
    return (req, _, next) => {

        // TODO: add req properties: user, fields, intent
        Object.defineProperties(req, {
            user: {
                get: (): string|GUEST => {
                    // TODO: ensure session exists...
                    return req.session!.user || GUEST;
                },
                set: (value: string|GUEST) => {
                    // TODO: ensure user is a string...
                    // TODO: ensure session exists...
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
                    let method = req.method.toUpperCase(); // TODO: allow overriding via querystring/body/capture
                    return `${method} ${resource}`;
                },
                enumerable: true,
            },
        });

        // Continue with next middleware function.
        next();
    };
}
