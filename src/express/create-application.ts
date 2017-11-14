import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import {Store} from 'express-session';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as sessionFileStore from 'session-file-store';
import {AccessTable} from '../authorisation';
import {ApplicationConfig, ApplicationOptions, validate} from './application-options';
import * as middleware from './middleware';
// import * as net from 'net';
// import debug from '../debug';
// import createAccessControlMiddleware from './create-access-control-middleware';
// import createDispatcherMiddleware, {Handler} from './create-dispatcher-middleware';





export interface RoutistExpressApplication extends express.Application {
    // routes: { [filter: string]: RouteHandler };
    access: AccessTable;
    refine: {
    //     routes(value: RoutistExpressApplication['routes']): void;
        access(value: AccessTable): void;
    };
}





export default function createApplication(options?: ApplicationOptions) {

    // Validate options.
    const config = validate(options || {});

    // Create a new express aplication.
    const app = express();

    // If the app is running behind a reverse proxy, then trust the X-Forwarded-For headers.
    app.set('trust proxy', config.usingReverseProxy);

    // If a 'GET /favicon.ico' request reaches this app, serve the configured icon file.
    app.use(favicon(path.resolve(process.cwd(), config.faviconPath)));

    // Install session middleware. NB: If this app is mounted as a subapp within an app that already
    // has session middleware, then this session middleware will have no effect.
    app.use(session({
        name: 'sid',
        cookie: { maxAge: config.sessions.ttl * 1000 },
        secret: config.sessions.secret,
        resave: false,
        saveUninitialized: true,
        store: createSessionStore(config.sessions),
    }));

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
    let augmentedApp = augmentApplication(app);
    return augmentedApp;
}





function createSessionStore(config: ApplicationConfig['sessions']) {

    // TODO: remove cast when @types/session-file-store is fixed
    let FileStore: typeof sessionFileStore = (sessionFileStore as any)(session);

    switch (config.type) {
        case 'fs':
            return new FileStore({
                path: path.resolve(process.cwd(), config.dir),
                ttl: config.ttl,
                reapIntervalObject: null,
            }) as any as Store; // TODO: remove cast when @types/session-file-store is fixed
        case 'memory':
            return new session.MemoryStore() as Store;
        default:
            throw new Error(`Unsupported session type '${config.type}'`);
    }
}




// TODO: ...
function augmentApplication(app: express.Application) {

    let aug = middleware.augmentRequest;
    let log = middleware.logRequest;
    let acl = middleware.createAccessControlMiddleware();
    let err = middleware.handleErrors;

    let augmentedApp = app as express.Application as RoutistExpressApplication;
    augmentedApp.use(aug, log, acl, err);
    augmentedApp.access = acl.access;
    augmentedApp.refine = {
        access(table: AccessTable) {
            Object.keys(table).forEach(routeFilter => {
                acl.access[routeFilter] = table[routeFilter];
            });
        },
    };

    // augmentedApp.use(createRequestAugmentationMiddleware(), log, ac, disp);
    // augmentedApp.access = ac.access;
    // augmentedApp.routes = disp.routes;

    // // TODO: poor man's refine... Fix this
    // augmentedApp.refine = {
    //     access(obj: any) {
    //         Object.keys(obj).forEach(key => {
    //             app.access[key] = obj[key];
    //         });
    //     },
    //     routes(obj: any) {
    //         Object.keys(obj).forEach(key => {
    //             app.routes[key] = obj[key];
    //         });
    //     },
    // };

    return augmentedApp;
}
