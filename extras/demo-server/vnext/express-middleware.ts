import {Request, RequestHandler, Response} from 'express';
import * as multimethods from 'multimethods';
import * as url from 'url';
import debug from '../../../src/util/debug';





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
                result = multimethods.meta(async (req: Request, res: Response, _: {}, next: Function) => {
                    await handler(req, res);
                    let policy = (req as any)[ACCESS_CONTROL_POLICY_KEY]; // TODO: fix cast...
                    debug(`SET POLICY TO ${policy ? 'ALLOW' : 'DENY'} for ${predicate}`);
                    return next(req, res);
                }) as Handler;
            }
            else {
                result = async (req, res) => {
                    // check access first
                    let policy = (req as any)[ACCESS_CONTROL_POLICY_KEY]; // TODO: fix cast...
                    if (!policy) throw new Error(`Not permitted`); // TODO: use proper 401/403 error signalling
                    return handler(req, res);
                };
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
        let currentPolicy = (req as any)[ACCESS_CONTROL_POLICY_KEY] || false; // TODO: fix cast...
        let newPolicy = await(policy(user, currentPolicy));
        (req as any)[ACCESS_CONTROL_POLICY_KEY] = newPolicy; // TODO: fix cast...
    };
    ACCESS_CONTROL_FUNCTIONS.add(result);
    return result;
}





export const ALWAYS = () => true;
export const NEVER = () => false;
export const ACCESS_CONTROL_FUNCTIONS = new WeakSet<Function>();
const ACCESS_CONTROL_POLICY_KEY = Symbol('accessControlPolicy');





export function updateSession(paramNames: {username: string; password: string}): Handler {
    return async req => {
        let username = (req.body || {})[paramNames.username] || req.query[paramNames.username];
        // let password = (req.body || {})[paramNames.password] || req.query[paramNames.password];

        // TODO: verify usn/pwd combo... For testing purposes, just set the user without checking the password...
        if (typeof username === 'string') {
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
