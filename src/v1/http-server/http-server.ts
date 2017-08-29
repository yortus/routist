import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import * as sessionFileStore from 'session-file-store';
import RouteTable from '../route-table';
import debug from '../util/debug';
import {AccessControlMiddleware, createAccessControlMiddleware} from './express-middleware';
import {createRouteTableMiddleware, RouteTableMiddleware} from './express-middleware';
import HttpConfiguration from './http-configuration';
import HttpOptions from './http-options';





// TODO: add more middleware:
// - helmet (CSP etc)
// - CORS
// - better code for app.enable('trust proxy'); (see express docs)





// TODO:
// - [ ] better Session typing / public interface
// - [ ] Clearance type (branded string?)
// - [ ] move allow/deny(iff) decorators in here; use the Clearance type





// TODO: doc...
export default class HttpServer {

    /** Create a new HttpServer instance. */
    constructor(options?: HttpOptions) {

        // Create configuration based on provided options.
        this.config = new HttpConfiguration(options); // NB: may throw if options are invalid

        // Prepare the underlying express app.
        this.app = express();
        initApp(this.app, this.config);

        // Prepare the access control and routing middleware, and add them to the express app's middleware stack.
        this.accessControlMiddleware = createAccessControlMiddleware(this.config);
        this.routeTableMiddleware = createRouteTableMiddleware();
        this.app.use(this.accessControlMiddleware); // TODO: correct position in middleware stack? Review...
        this.app.use(this.routeTableMiddleware);
    }

    // TODO: doc...
    updateRouteTable(routes: RouteTable) {
        this.accessControlMiddleware.update(routes);
        this.routeTableMiddleware.update(routes);
    }

    /** Start the HTTP server */
    start() {
        return new Promise<void>((resolve, reject) => {
            this.app.listen(this.config.port, () => {
                debug(`HTTP server listening on port ${this.config.port}`);
                resolve();
            }).on('error', reject);
        });
    }

    // TODO: add stop() method

    private config: HttpConfiguration;

    private app: express.Application;

    private accessControlMiddleware: AccessControlMiddleware;

    private routeTableMiddleware: RouteTableMiddleware;
}





function initApp(app: express.Application, config: HttpConfiguration) {

    // TODO: This will only suit some applications... make configurable via options... (and simplify?)
    app.set('trust proxy', '::ffff:127.0.0.1');

    // Add session-handling middleware.
    // TODO: remove cast when @types/session-file-store is fixed
    const FileStore: typeof sessionFileStore = (sessionFileStore as any)(session);
    app.use(session({
        name: 'sid',
        secret: config.secret,
        resave: false,
        saveUninitialized: true,
        store: new FileStore({
            path: config.sessionsDir,
            ttl: 3600, // 1 hour
        }) as any, // TODO: remove cast when @types/session-file-store is fixed
    }));

    // Add middleware to compress all responses.
    // TODO: make configurable...
    app.use(compression());

    // Add middleware to automatically parse request bodies.
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
}
