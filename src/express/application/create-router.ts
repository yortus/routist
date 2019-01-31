import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import {Store} from 'express-session';
import {AccessRule} from '../../access-table';
import {RouteTable} from '../../route-handling';
import * as middleware from '../middleware';
import {ApplicationConfig, ApplicationOptions, validate} from './application-options';





// TODO: ...
export interface ExpressRouter extends express.Application {

    routes: never; // override express decl of `routes`
    refineRoutes(newRoutes: RouteTable): ExpressRouter;
    refineAccess(newRules: {[pathQualifier: string]: AccessRule}): ExpressRouter;
    queryAccess(user: string | null, resource: string): Promise<boolean>;

    // TODO: was...
    // routes: RouteTable;
    // access: AccessTable;
    // refine: {
    //     routes(newRoutes: RouteTable): void;
    //     access(newRules: {[resourceQualifier: string]: AccessRule}): void;
    // };
}





// TODO: ...
export default function createRouter(options?: ApplicationOptions): ExpressRouter {

    // Validate options.
    const config = validate(options || {});

    // Create a new express aplication.
    const app = express();

    // If the app is running behind a reverse proxy, then trust the X-Forwarded-For headers.
    app.set('trust proxy', config.usingReverseProxy);

    // Install session-handling middleware. NB: If this app is mounted as a subapp within an app
    // that already has session middleware, then this session middleware will have no effect.
    addSessionMiddleware(app, config);

    // If the app requires body parsing, install middleware for it.
    if (config.parseBody) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
    }

    // If the app requires response compression, install middleware for it.
    if (config.compressResponses) {
        app.use(compression());
    }

    // Install routist middleware.
    let augmentedApp = addRoutistMiddlewareAndAugment(app, config);
    return augmentedApp;
}





function addSessionMiddleware(app: express.Application, config: ApplicationConfig) {

    // Create a session store as per config. Also generate cleanup code for the store.
    let store: Store | undefined;
    switch (config.sessions.type) {
        case 'none':
            break;
        case 'memory':
            store = new session.MemoryStore() as Store;
            break;
        default:
            throw new Error(`Unsupported session type '${config.sessions.type}'`);
    }

    // TODO: ...
    if (store) {
        app.use(session({
            name: 'sid',
            cookie: { maxAge: config.sessions.ttl * 1000 },
            secret: config.sessions.secret,
            resave: false,
            rolling: true,
            saveUninitialized: true,
            store,
        }));
    }
}





// TODO: ...
function addRoutistMiddlewareAndAugment(app: express.Application, config: ApplicationConfig) {

    let logRequest = middleware.createRequestLoggerMiddleware(config);
    let authorise = middleware.createAccessControlMiddleware(config);
    let dispatch = middleware.createRouteDispatchMiddleware(config);

    let augmentedApp = app as express.Application as ExpressRouter;
    augmentedApp.use(logRequest, authorise, dispatch);



// TODO: fixing...
//    augmentedApp.access = authorise.access;
//    augmentedApp.routes = dispatch.routes;
    augmentedApp.refineRoutes = newRoutes => {
        Object.keys(newRoutes).forEach(intentFilter => {
            dispatch.routes[intentFilter] = newRoutes[intentFilter];
        });
        return augmentedApp;
    };

    augmentedApp.refineAccess = newRules => {
        authorise.access.extend(newRules);
        return augmentedApp;
    };

    augmentedApp.queryAccess = async (user, resource) => {
        return await authorise.access.query(user, resource);
    };

    return augmentedApp;
}
