import Handler from './handler';
export interface HttpServerOptions {
    secret?: string;
    port?: number;
}
export declare class HttpServer {
    /** Create a new HttpServer instance. */
    constructor(options?: HttpServerOptions);
    /** Start the HTTP server */
    start(): void;
    /** Add routes to the HTTP server's route-handling multimethod. */
    add<T extends {
        [K in keyof T]: Handler;
    }>(newRoutes: T): void;
    private app;
    private mm;
    private port;
}
declare const httpServer: HttpServer;
export default httpServer;
