import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import * as sessionFileStore from 'session-file-store';
import MultimethodsMiddleware from './multimethods-middleware';
import Handler from './handler';





// TODO: add more middleware:
// - helmet (CSP etc)
// - CORS
// - app.enable('trust proxy'); if using nginx (see express docs)





// TODO:
// *don't* export a default httpServer; just export the HttpServer class
// better Session typing / public interface
// Clearance type (branded string?)
// move allow/deny(iff) decorators in here; use the Clearance type





// TODO: doc...
export interface HttpServerOptions {
    secret?: string;
    port?: number;

    // TODO: ...
    // session secret
    // logging options / verbosity / output to
    // public static files serving - give base dir / option to disable?
    // permissions:
    //     function mapping from session.username to full (sorted?) list of clearances

}





// TODO: doc...
export class HttpServer {

    /** Create a new HttpServer instance. */
    constructor(options?: HttpServerOptions) {

        // TODO: normalise options
        options = {...options};
        options.secret = options.secret || ''; // TODO: best default?
        options.port = options.port || 8080; // TODO: best default?

        // Set instance properties
        this.port = options.port;

        // TODO: correct?
        this.app.set('trust proxy', '::ffff:127.0.0.1');

        // Add session-handling middleware.
        const FileStore = sessionFileStore(session);
        this.app.use(session({
            name: 'sid',
            secret: options.secret,
            resave: false,
            saveUninitialized: true,
            store: new FileStore({
                path: path.resolve(path.resolve(require('app-root-path').toString(), process.env.APP_DATA), 'sessions'),
                ttl: 3600, // 1 hour
            })
        }));

        // Add middleware to compress all responses.
        this.app.use(compression());

        // Add middleware to automatically parse request bodies.
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));

        // Add middleware to delegate route handling to a multimethod.
        this.app.use(this.mm);
    }    

    /** Start the HTTP server */
    start() {
        this.app.listen(this.port, () => {
            console.log(`HTTP server listening on port ${this.port}`);
        });
    }

    /** Add routes to the HTTP server's route-handling multimethod. */
    add<T extends {[K in keyof T]: Handler}>(newRoutes: T) {
        this.mm.add(newRoutes);
    }

    private app = express();

    private mm = new MultimethodsMiddleware();

    private port: number;
};





// TODO: doc...
// TODO: best options??
const httpServer = new HttpServer({
    secret: 'ThE trUTh i5 0uT tHeRE', // TODO: remove from source
    port: process.env.APP_PORT || 8080
});
export default httpServer;
