import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import * as multimethods from 'multimethods';
import * as net from 'net';
import {machineIdSync} from 'node-machine-id';
import * as path from 'path';
import * as sessionFileStore from 'session-file-store';
import * as url from 'url';
import debug from '../../../src/util/debug';
import {Constructor, Message} from './core-types';
import {DispatchTable, MessageHandler, Reply} from './dispatch';





export interface HttpServerOptions {
    dispatchTable: Constructor<DispatchTable>;
}





export class HttpServer {
    constructor(options: HttpServerOptions) {

        // TODO: temp testing create message server
        this.messageServer = multimethods.create<Message, Reply>({
            arity: 1,
            async: undefined,
            toDiscriminant: msg => `${msg.receiver}${msg.selector === 'GET' ? '' : `:${msg.selector}`}`,
            methods: new options.dispatchTable(), // TODO: any checking needed?
        });

        // TODO: temp testing create config
        this.config = {
            secret: machineIdSync(),
            port: 8080,
            sessionDir: path.resolve(process.cwd(), 'sessions'),
            sessionTimeout: 600,
        };
    }

    /** Start the HTTP server */
    start() {
        // Fail if already started
        if (this.expressApp !== null) {
            throw new Error(`HttpServer already started.`);
        }

        // Prepare the underlying express app.
        let app = this.expressApp = express();
        this.exitApp = initApp(this.expressApp, this.config);
        this.expressApp.use(makeMessageForwardingMiddleware(this.messageServer));

        // Start the HTTP server asynchronously.
        return new Promise<void>((resolve, reject) => {

            // Begin listening for incoming HTTP requests.
            this.httpServer = app.listen(this.config.port, () => {
                debug(`HttpServer listening on port ${this.config.port}`);
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
            throw new Error(`HttpServer not started.`);
        }

        // Stop the HTTP server asynchronously.
        return new Promise<void>((resolve, reject) => {

            // Ask the HTTP server to stop accepting new connections.
            this.httpServer.close((err: any) => {
                if (err) return reject(err);
                debug(`HttpServer closed`);
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

    private messageServer: MessageHandler;

    private expressApp: express.Application | null = null;

    // TODO: this is a messy bit... better way to track?
    private exitApp: ExitApp;

    private httpServer: net.Server;

    private openSockets = new Set<net.Socket>();
}





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





function makeMessageForwardingMiddleware(handler: MessageHandler) {
    let result: express.RequestHandler;
    result = async (request, response, next) => {

        // TODO: log request...
        debug(`HTTP Request: ${request.method} ${request.url}`);

        // TODO: create Message instance
        let executor = ''; // TODO: ...
        let receiver = `${url.parse(request.url).pathname || ''}`;
        let selector = `${request.method}`; // TODO: ...
        let args = {}; // TODO: ...
        let message = {executor, receiver, selector, arguments: args};
        // TODO: payload if...

        try {
            let reply = await handler(message, {});
            if (reply) {
                switch (reply.type) {
                    case 'json': return response.json(reply.value);
                    default: throw new Error(`Unknown payload type '${reply.type}'`);
                }
            }
            else {
                return response.sendStatus(200); // TODO: ...
            }
        }
        catch (err) {
            return next(err);
        }
    };
    return result;
}





interface HttpConfiguration {
    secret: string;
    port: number;
    sessionDir: string;
    sessionTimeout: number;
}





// TODO: doc...
type ExitApp = () => void;
