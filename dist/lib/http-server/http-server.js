Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const bodyParser = require("body-parser");
const compression = require("compression");
const express = require("express");
const session = require("express-session");
const sessionFileStore = require("session-file-store");
const multimethods_middleware_1 = require("./multimethods-middleware");
// TODO: doc...
class HttpServer {
    /** Create a new HttpServer instance. */
    constructor(options) {
        this.app = express();
        this.mm = new multimethods_middleware_1.default();
        // TODO: normalise options
        options = Object.assign({}, options);
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
                ttl: 3600,
            })
        }));
        // Add middleware to compress all responses.
        this.app.use(compression());
        // Add middleware to automatically parse request bodies.
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
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
    add(newRoutes) {
        this.mm.add(newRoutes);
    }
}
exports.HttpServer = HttpServer;
;
// TODO: doc...
// TODO: best options??
const httpServer = new HttpServer({
    secret: 'ThE trUTh i5 0uT tHeRE',
    port: process.env.APP_PORT || 8080
});
exports.default = httpServer;
//# sourceMappingURL=http-server.js.map