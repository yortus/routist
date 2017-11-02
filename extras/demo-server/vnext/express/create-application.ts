import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
// import * as net from 'net';
import {machineIdSync} from 'node-machine-id';
import * as path from 'path';
import * as sessionFileStore from 'session-file-store';
// import debug from '../../../src/util/debug';

import {AccessGuard} from '../access-guards';
import createRequestAugmentationMiddleware from './create-request-augmentation-middleware';
import createAccessControlMiddleware from './create-access-control-middleware';
import createDispatcherMiddleware, {Handler} from './create-dispatcher-middleware';





export interface RoutistExpressApplication extends express.Application {
    routes: { [filter: string]: Handler };
    access: { [filter: string]: AccessGuard };
    refine: {
        routes(value: RoutistExpressApplication['routes']): void;
        access(value: RoutistExpressApplication['access']): void;
    };
}





// TODO: all adjustable config goes here...
const config = {
    port: 8080,
    secret: machineIdSync(),
    sessionDir: path.resolve(process.cwd(), 'sessions'),
    sessionTimeout: 600,
};





export default function createApplication() {

    // TODO: this is internal module state...
    const app = express() as express.Application as RoutistExpressApplication;

    // let started = false;
    // let stopped = false;
    const fileStoreOptions: sessionFileStore.Options = {
        path: config.sessionDir,
        ttl: config.sessionTimeout,
        reapIntervalObject: null,
    };
    // let httpServer: net.Server;
    // const openSockets = new Set<net.Socket>();

    // TODO: temp testing...
    initialise(app, fileStoreOptions);

    return app;
}





// Configure the express application.
function initialise(app: RoutistExpressApplication, fileStoreOptions: sessionFileStore.Options) {

    // TODO: This will only suit some applications... make configurable via options... (and simplify?)
    app.set('trust proxy', '::ffff:127.0.0.1');

    // Add session-handling middleware.
    let FileStore: typeof sessionFileStore;
    FileStore = (sessionFileStore as any)(session); // TODO: remove cast when @types/session-file-store is fixed
    app.use(session({
        name: 'sid',
        secret: config.secret,
        resave: false,
        saveUninitialized: true,
        store: new FileStore(fileStoreOptions) as any, // TODO: remove cast when @types/session-file-store is fixed
    }));

    // Add middleware to compress all responses.
    // TODO: make configurable...
    app.use(compression());

    // Add middleware to automatically parse request bodies.
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    // TODO: Add our own middleware...
    let ac = createAccessControlMiddleware();
    let disp = createDispatcherMiddleware();
    app.use(createRequestAugmentationMiddleware(), ac, disp);
    app.access = ac.access;
    app.routes = disp.routes;
}





// TODO: restore...?
// export function start() {

//     // Fail if already started
//     if (started) {
//         throw new Error(`HttpServer already started.`);
//     }
//     started = true;

//     // Start the HTTP server asynchronously.
//     return new Promise<void>((resolve, reject) => {

//         // Begin listening for incoming HTTP requests.
//         httpServer = app.listen(config.port, () => {
//             debug(`HttpServer listening on port ${config.port}`);
//             resolve();
//         })

//         // Keep track of open connections, so they can be manually closed in `stop` if necessary.
//         .on('connection', (socket: net.Socket) => {
//             openSockets.add(socket);
//             socket.on('close', () => openSockets.delete(socket));
//         })

//         // Detect server startup failure.
//         .once('error', (err: any) => {
//             reject(err);
//         });
//     });
// }





// TODO: restore...?
// export function stop() {

//     // Fail if not started or already stopped
//     if (!started || stopped) {
//         throw new Error(`HttpServer not started or already stopped.`);
//     }
//     stopped = true;

//     // Stop the HTTP server asynchronously.
//     return new Promise<void>((resolve, reject) => {

//         // Ask the HTTP server to stop accepting new connections.
//         httpServer.close((err: any) => {
//             if (err) return reject(err);
//             debug(`HttpServer closed`);
//             resolve();
//         });

//         // Perform shutdown steps on the express app.
//         if (fileStoreOptions.reapIntervalObject) {
//             clearInterval(fileStoreOptions.reapIntervalObject!);
//         }

//         // If there are still open connections, give them a second to close, otherwise destroy them.
//         if (openSockets.size > 0) {
//             let destroyOpenSockets = () => openSockets.forEach(socket => socket.destroy());
//             setTimeout(destroyOpenSockets, 1000);
//         }
//     });
// }
