import {Request, RequestHandler, Response} from 'express';
import * as multimethods from 'multimethods';
import * as url from 'url';
import debug from './debug';





// tslint:disable-next-line:no-namespace
declare global {
    export namespace Express {
        // tslint:disable-next-line:no-shadowed-variable
        export interface Request {
            //user: string|undefined;
            fields: {[name: string]: {}};
            intent: string;



// TODO: was...
            // accessControlPolicy: boolean;
            // arguments: {[name: string]: {}};
        }
        // export interface Session {
        //     user: string|undefined;
        // }
    }
}





export function createRouteTable() {

    let queries = {} as RouteTable;
    let actions = {} as RouteTable;
    let middleware = Object.assign(createMiddlewareFunction(), {
        queries: new Proxy(queries, { set: (_, key, value) => setRoute('q', key, value) }),
        actions: new Proxy(actions, { set: (_, key, value) => setRoute('a', key, value) }),
    });

    let routes = {} as RouteTable;
    function setRoute(type: 'q' | 'a', key: PropertyKey, value: Handler | Handler[]): boolean {
        debug(`Updating ${type === 'q' ? 'query' : 'action'} route '${key}'`);

        // TODO: compute predicate...
        if (typeof key !== 'string') throw new Error(`Invalid key. Expected a string.`); // TODO: improve error msg
        let predicate = `${type}:`;
        let matches = key.match(/^(.*):\s*/);
        if (matches) {
            let specifier = matches[1];
            if (specifier !== '*' && !/^\w+$/.test(specifier)) {
                throw new Error(`'${specifier}' is not a valid specifier. Expected an identifier or wildcard`);
            }
            predicate += `${specifier}:`;
            key = key.substr(matches[0].length);
        }
        predicate += ` ${key}`;

        // TODO: compute handlers...
        let handlers = Array.isArray(value) ? value : [value];
        handlers = handlers.map(handler => {
            let result: Handler;
            if (ACCESS_CONTROL_FUNCTIONS.has(handler)) {
                result = multimethods.meta(async (req: Request, res: Response, captures: {}, next: Function) => {

                    // Add captures to req.arguments
                    Object.assign(req.arguments, captures);

                    // Compute new access control policy
                    await handler(req, res);
                    debug(`SET POLICY TO ${req.accessControlPolicy ? 'ALLOW' : 'DENY'} for ${predicate}`);

                    // Continue with downstream routes
                    return next(req, res);
                }) as Handler;
            }
            else {
                result = (async (req: Request, res: Response, captures: {}) => {
                    // check access first
                    let policy = req.accessControlPolicy;
                    if (!policy) throw new Error(`Not permitted`); // TODO: use proper 401/403 error signalling

                    // Add captures to req.arguments
                    Object.assign(req.arguments, captures);

                    // Delegate to client-provided handler
                    return handler(req, res);
                }) as Handler;
            }
            return result;
        });

        // Update the routes table
        routes[predicate] = handlers;
        middleware.updateRoutes(routes);
        return true;
    }

    return middleware;
}





export interface RouteTable {
    [pattern: string]: Handler | Handler[];
}
export type Handler = (req: Request, res: Response) => Promise<any>;





interface Middleware extends RequestHandler {
    updateRoutes(value: RouteTable): void;
}





function createMiddlewareFunction(): Middleware {

    function renewDispatchFunction(routes: RouteTable) {
        return multimethods.create<Request, Response, void>({
            arity: 2,
            async: true,
            toDiscriminant: req => {
                let resource = url.parse(req.url).pathname || '';
                let method = req.method.toLowerCase();
                let methodOverride = (req.query[method === 'get' ? 'query' : 'action'] || '').toLowerCase();
                if (method === 'get' || method === 'post') {
                    // e.g.:
                    //    q: /users/123          -- GET request
                    //    a: /users              -- POST request
                    //    a:delete: /users/123   -- POST request with ?action=delete
                    return `${method === 'get' ? 'q' : 'a'}:${methodOverride && (methodOverride + ':')} ${resource}`;
                }
                else {
                    // TODO: support other methods by allowing client code to provide a map: allowed method -> suffix
                    throw new Error(`Method '${req.method}' not supported`);
                }
            },
            methods: routes,
        });
    }

    let mm = renewDispatchFunction({});

    let result = (async (req, res, next) => {

        // TODO: log request...
        debug(`HTTP Request: ${req.method} ${req.url}`);

        // TODO: add req properties: user, fields, intent, authorised
        Object.defineProperties(req, {
            user: {
                get: () => {
                    // TODO: ensure session exists...
                    return req.session!.user || undefined;
                },
                set: (value: string|undefined) => {
                    // TODO: ensure user is a string...
                    // TODO: ensure session exists...
                    req.session!.user = value;
                },
                enumerable: true,
            },
            fields: {
                // TODO: ...
            },
            intent: {
                get: () => {
                    // TODO: ...
                    let resource = url.parse(req.url).pathname || '';
                    let method = req.method.toLowerCase(); // TODO: allow overriding via querystring/body/capture

                    
                },
                enumerable: true,
            },
        });

        // TODO: initialise `req.arguments`
        // TODO: safe to use req.body as an object here?
        req.arguments = Object.assign({body: req.body}, req.query);

        // TODO: dispatch through multimethod...
        try {
            await mm(req, res);
        }
        catch (err) {
            next(err);
        }
    }) as Middleware;

    result.updateRoutes = value => {
        mm = renewDispatchFunction(value);
    };

    return result;
}





export function allow(policy: (user: string|undefined, currentPolicy: boolean) => boolean | Promise<boolean>): Handler {
    let result: Handler = async req => {
        let user = req.session!.user || undefined;
        let currentPolicy = req.accessControlPolicy || false;
        let newPolicy = await(policy(user, currentPolicy));
        req.accessControlPolicy = newPolicy;
    };
    ACCESS_CONTROL_FUNCTIONS.add(result);
    return result;
}





export const ALWAYS = () => true;
export const NEVER = () => false;
export const ACCESS_CONTROL_FUNCTIONS = new WeakSet<Function>();





export function updateSession(fields: {username: string; password: string}): Handler {
    return async req => {
        let username = req.arguments[fields.username];
        // let password = req.arguments[params.password];

        // TODO: verify usn/pwd combo... For testing purposes, just set the user without checking the password...
        if (typeof username === 'string') {
            // NB blank string will clear the session-user binding (ie log out)
            req.session!.user = username || undefined;
        }
        return multimethods.CONTINUE;
    };
}





export function error(message: string): Handler {
    return async () => {
        throw new Error(message);
    };
}





export function json(): Handler {
    return async (_, res) => {
        res.send({});
    };
}
