import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as session from 'express-session';
import * as sessionFileStore from 'session-file-store';
import Router from '../router';
import debug from '../util/debug';
import createRouterMiddleware, {RouterMiddleware} from './create-router-middleware';
import NormalOptions from './normal-options';
import normaliseOptions from './normalise-options';
import Options from './options';
import validateOptions from './validate-options';





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
    constructor(options?: Options) {

        // Validate and normalise options.
        options = options || {};
        validateOptions(options);
        this.options = normaliseOptions(options);
        Object.freeze(this.options);

        // Prepare the underlying express app.
        this.app = express();
        initApp(this.app, this.options);

        // Prepare the router middleware and add it to the express app's middleware stack.
        this.routerMiddleware = createRouterMiddleware();
        this.app.use(this.routerMiddleware);
    }

    // TODO: doc...
    get router() {
        return this.routerMiddleware.router;
    }

    // TODO: doc...
    set router(value: Router) {
        this.routerMiddleware.router = value;
    }

    /** Start the HTTP server */
    start() {
        return new Promise<void>((resolve, reject) => {
            this.app.listen(this.options.port, () => {
                debug(`HTTP server listening on port ${this.options.port}`);
                resolve();
            }).on('error', reject);
        });
    }

    // TODO: add stop() method

    private options: Readonly<NormalOptions>;

    private app: express.Application;

    private routerMiddleware: RouterMiddleware;
}





function initApp(app: express.Application, options: NormalOptions) {

    // TODO: This will only suit some applications... make configurable via options... (and simplify?)
    app.set('trust proxy', '::ffff:127.0.0.1');

    // Add session-handling middleware.
    // TODO: remove cast when @types/session-file-store is fixed
    const FileStore: typeof sessionFileStore = (sessionFileStore as any)(session);
    app.use(session({
        name: 'sid',
        secret: options.secret,
        resave: false,
        saveUninitialized: true,
        store: new FileStore({
            path: options.sessionsDir,
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
