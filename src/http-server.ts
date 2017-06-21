import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import * as sessionFileStore from 'session-file-store';
import Handler from './http-server/handler';
import HttpServerOptions from './options/http-server-options';
import MultimethodsMiddleware from './http-server/multimethods-middleware';
import normaliseOptions from './options/normalise-options';





// TODO: add more middleware:
// - helmet (CSP etc)
// - CORS
// - app.enable('trust proxy'); if using nginx (see express docs)





// TODO:
// - [x] *don't* export a default httpServer; just export the HttpServer class
// - [ ] better Session typing / public interface
// - [ ] Clearance type (branded string?)
// - [ ] move allow/deny(iff) decorators in here; use the Clearance type





// TODO: doc...
export default class HttpServer {

    /** Create a new HttpServer instance. */
    constructor(options?: Partial<HttpServerOptions>) {

        // TODO: normalise and validate options...
        this.options = normaliseOptions(options || {});
        Object.freeze(this.options);

        // TODO: correct? make configurable via options...
        this.app.set('trust proxy', '::ffff:127.0.0.1');

        // Add session-handling middleware.
        // TODO: remove cast when @types/session-file-store is fixed
        const FileStore: typeof sessionFileStore = (sessionFileStore as any)(session);
        this.app.use(session({
            name: 'sid',
            secret: this.options.secret,
            resave: false,
            saveUninitialized: true,
            store: new FileStore({
                path: path.join(path.resolve(require('app-root-path').toString(), process.env.APP_DATA || '.'), 'sessions'), // TODO: doc env.APP_DATA. Or put in Options interface?
                ttl: 3600, // 1 hour
            }) as any // TODO: remove cast when @types/session-file-store is fixed
        }));

        // Add middleware to compress all responses.
        // TODO: make configurable...
        this.app.use(compression());

        // Add middleware to automatically parse request bodies.
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));

        // Add middleware to delegate route handling to a multimethod.
        this.app.use(this.mm);
    }

    /** Start the HTTP server */
    start() {
        this.app.listen(this.options.port, () => {
            console.log(`HTTP server listening on port ${this.options.port}`);
        });
    }

    /** Add routes to the HTTP server's route-handling multimethod. */
    add<T extends {[K in keyof T]: Handler}>(newRoutes: T) {
        this.mm.add(newRoutes);
    }

    private app = express();

    private mm = new MultimethodsMiddleware();

    private options: Readonly<HttpServerOptions>;
};
