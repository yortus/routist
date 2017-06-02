/// <reference types="express" />
import * as express from 'express';
import Handler from './handler';
declare class MultimethodsMiddleware {
    constructor();
    add<T extends {
        [K in keyof T]: Handler;
    }>(newRoutes: T): void;
    private mm;
    private allRoutes;
}
interface MultimethodsMiddleware {
    (req: express.Request, res: express.Response, next: express.NextFunction): false | void | Promise<false | void>;
}
export default MultimethodsMiddleware;
