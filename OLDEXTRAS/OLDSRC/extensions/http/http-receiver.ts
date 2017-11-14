import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import * as net from 'net';
import * as sessionFileStore from 'session-file-store';
import * as url from 'url';
import {Message, Receiver} from '../../core';
import debug from '../../util/debug';
import HttpConfiguration from './http-configuration';
import HttpMessage from './http-message';
import HttpOptions from './http-options';





// TODO:
// - [ ] add more middleware:
//   - [ ] helmet (CSP etc)
//   - [ ] CORS
// - [ ] better code for app.enable('trust proxy'); (see express docs)
// - [ ] better Session typing / public interface





export default class HttpReceiver implements Receiver {

    constructor(options?: HttpOptions) {

        // Create configuration based on provided options.
        this.config = new HttpConfiguration(options); // NB: may throw if options are invalid
    }

    /** Start the HTTP server */
    start(cb: (msg: Message) => (void|Promise<void>)) {

        // Fail if already started
        if (this.expressApp !== null) {
            throw new Error(`HttpReceiver already started.`);
        }

        // Prepare the underlying express app.
        let app = this.expressApp = express();
        this.exitApp = initApp(this.expressApp, this.config);
        this.expressApp.use(makeForwarder(cb));

        // Start the HTTP server asynchronously.
        return new Promise<void>((resolve, reject) => {

            // Begin listening for incoming HTTP requests.
            this.httpServer = app.listen(this.config.port, () => {
                debug(`HTTP server listening on port ${this.config.port}`);
                resolve();
            })

            // Keep track of open connections, so they can be manually closed in `stop` if necessary.
            .on('connection', (socket: net.Socket) => {
                this.openSockets.add(socket);
                socket.on('close', () => this.openSockets.delete(socket));
            })

            // Detect server startup failure.
            .once('error', (err: any) => {
                this.expressApp = null;
                reject(err);
            });
        });
    }

    /** Stop the HTTP server */
    stop() {

        // Fail if not started
        if (this.expressApp === null) {
            throw new Error(`HttpReceiver not started.`);
        }

        // Stop the HTTP server asynchronously.
        return new Promise<void>((resolve, reject) => {

            // Ask the HTTP server to stop accepting new connections.
            this.httpServer.close((err: any) => {
                if (err) return reject(err);
                debug(`HTTP server closed`);
                resolve();
            });

            // Perform shutdown steps on the express app.
            this.expressApp = null;
            this.exitApp();

            // If there are still open connections, give them a second to close, otherwise destroy them.
            if (this.openSockets.size > 0) {
                let destroyOpenSockets = () => this.openSockets.forEach(socket => socket.destroy());
                setTimeout(destroyOpenSockets, 1000);
            }
        });
    }

    private config: HttpConfiguration;

    private expressApp: express.Application | null = null;

    // TODO: this is a messy bit... better way to track?
    private exitApp: ExitApp;

    private httpServer: net.Server;

    private openSockets = new Set<net.Socket>();
}





// TODO: messy way...
type ExitApp = () => void;





function initApp(app: express.Application, config: HttpConfiguration): ExitApp {

    // TODO: This will only suit some applications... make configurable via options... (and simplify?)
    app.set('trust proxy', '::ffff:127.0.0.1');

    // Add session-handling middleware.
    // TODO: remove cast when @types/session-file-store is fixed
    const FileStore: typeof sessionFileStore = (sessionFileStore as any)(session);
    const fileStoreOptions = {
        path: config.sessionDir,
        ttl: config.sessionTimeout,
        reapIntervalObject: null,
    };

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

    // Return a function that will perform any necessary cleanup on the middleware used above.
    return () => {
        if (fileStoreOptions.reapIntervalObject) {
            clearInterval(fileStoreOptions.reapIntervalObject!);
        }
    };
}





function makeForwarder(cb: (msg: Message) => (void|Promise<void>)) {
    let result: express.RequestHandler;
    result = async (request, response, next) => {
        let protocol = 'http';
        let headline = `${request.method} ${url.parse(request.url).pathname || ''}`;
        let message = {protocol, headline, request, response} as HttpMessage;
        try {
            await cb(message);
        }
        catch (err) {
            next(err);
        }
    };
    return result;
}
