import * as express from 'express';
import * as url from 'url';
import GUEST from '../guest';





declare global {
    export namespace Express {
        // tslint:disable-next-line:no-shadowed-variable
        export interface Request {
            user: string | typeof GUEST;
            fields: { [name: string]: {} };
            intent: string;
        }
    }
}





export default function createRequestAugmentationMiddleware(): express.RequestHandler {
    return (req, _, next) => {

        // TODO: add req properties: user, fields, intent, authorised
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
                // TODO: ... use a proxy that delegates `get`s to params, query, body, captures (but which order?)
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
