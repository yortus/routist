import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import {EventEmitter} from 'events';
import * as express from 'express';
import * as session from 'express-session';
import {Store} from 'express-session';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as sessionFileStore from 'session-file-store';
import {AccessTable} from '../../access-control-types';
import {RouteTable} from '../../route-dispatch-types';
import * as middleware from '../middleware';
import {ApplicationConfig, ApplicationOptions, validate} from './application-options';
import getApplicationMetadata from './get-application-metadata';





// TODO: remove cast when @types/session-file-store is fixed
const FileStore: typeof sessionFileStore = (sessionFileStore as any)(session);





// TODO: ...
export interface RoutistExpressApplication extends express.Application {
    routes: RouteTable;
    access: AccessTable;
    refine: {
        routes(value: RouteTable): void;
        access(value: AccessTable): void;
    };
}





// TODO: ...
export default function createApplication(options?: ApplicationOptions): RoutistExpressApplication {

    // Validate options.
    const config = validate(options || {});

    // Create a new express aplication.
    const app = express();

    // If the app is running behind a reverse proxy, then trust the X-Forwarded-For headers.
    app.set('trust proxy', config.usingReverseProxy);

    // If a 'GET /favicon.ico' request reaches this app, serve the configured icon file.
    app.use(favicon(path.resolve(process.cwd(), config.faviconPath)));

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
    let augmentedApp = addRoutistMiddlewareAndAugment(app);
    return augmentedApp;
}





function addSessionMiddleware(app: express.Application, config: ApplicationConfig) {

    // Create a session store as per config. Also generate cleanup code for the store.
    let store: Store;
    let cleanupSessionMiddleware: () => void;
    switch (config.sessions.type) {
        case 'fs':
            let fileStoreOptions: sessionFileStore.Options = {
                path: path.resolve(process.cwd(), config.sessions.dir),
                ttl: config.sessions.ttl,
                reapIntervalObject: null,
            };
            // TODO: remove cast when @types/session-file-store is fixed
            store = new FileStore(fileStoreOptions) as any as Store;
            cleanupSessionMiddleware = () => {
                if (fileStoreOptions.reapIntervalObject) {
                    clearInterval(fileStoreOptions.reapIntervalObject);
                    fileStoreOptions.reapIntervalObject = null; // this makes the call idempotent
                }
            };
            break;
        case 'memory':
            store = new session.MemoryStore() as Store;
            cleanupSessionMiddleware = () => 0;
            break;
        default:
            throw new Error(`Unsupported session type '${config.sessions.type}'`);
    }

    // TODO: ...
    app.use(session({
        name: 'sid',
        cookie: { maxAge: config.sessions.ttl * 1000 },
        secret: config.sessions.secret,
        resave: false,
        saveUninitialized: true,
        store,
    }));

    // TODO: Add the cleanup code to the app's metadata...
    let appMetadata = getApplicationMetadata(app);
    let oldCleanup = appMetadata.cleanup;
    appMetadata.cleanup = () => { oldCleanup(); cleanupSessionMiddleware(); };
    (app as any as EventEmitter).on('mount', (parent: express.Application) => {
        // TODO: ^^^ remove cast above when '@types/express' is fixed
        // If mounted as a subapp, add cleanup steps to parent
        let parentAppMetadata = getApplicationMetadata(parent);
        let parentOldCleanup = parentAppMetadata.cleanup;
        parentAppMetadata.cleanup = () => { parentOldCleanup(); appMetadata.cleanup(); };
    });
}





// TODO: ...
function addRoutistMiddlewareAndAugment(app: express.Application) {

    let logRequest = middleware.logRequest;
    let authorise = middleware.createAccessControlMiddleware();
    let dispatch = middleware.createRouteDispatchMiddleware();

    let augmentedApp = app as express.Application as RoutistExpressApplication;
    augmentedApp.use(logRequest, authorise, dispatch);
    augmentedApp.access = authorise.access;
    augmentedApp.routes = dispatch.routes;
    augmentedApp.refine = {
        access(table: AccessTable) {
            Object.keys(table).forEach(intentFilter => {
                authorise.access[intentFilter] = table[intentFilter];
            });
        },
        routes(table: RouteTable) {
            Object.keys(table).forEach(intentFilter => {
                dispatch.routes[intentFilter] = table[intentFilter];
            });
        },
    };

    return augmentedApp;
}
