import * as url from 'url';
import * as express from 'express';
import {BinaryMultimethod} from 'multimethods';
import Handler from './handler';
import permissionsTag from './permissions-tag';





// TODO: use better UNHANDLED sentinel? Currently it's `false`.





// TODO: ...
// 1. logRequest
// 2. servePublicAssets
// 3. ensureAuthorisedUser
// 4. mm...





class MultimethodsMiddleware {

    constructor() {
        let expressHandler: express.Handler = async (req, res, next) => {
            try {
                let result = await instance.mm(req, res);
                if (result === false) {
                    next(); // UNHANDLED
                }
            }
            catch (err) {
                next(err);
            }
        };
        let instance = expressHandler as MultimethodsMiddleware;
        instance.add = MultimethodsMiddleware.prototype.add;
        instance.allRoutes = {};
        instance.add({});
        return instance;
    }

    add<T extends {[K in keyof T]: Handler}>(newRoutes: T) {

        // Ensure no clashing keys.
        Object.keys(newRoutes).forEach(key => {
            if (this.allRoutes.hasOwnProperty(key)) {
                throw new Error(`Duplicate route pattern '${key}'`);
            }
        });

// TODO: temp testing...
let permissions = (<any> newRoutes)[permissionsTag];
if (permissions !== undefined) {

    console.log('========== PERMISSIONS ==========');
    console.log(permissions);

}

        // Merge new routes into `allRoutes`.
// TODO: take permissions into account... how to merge them?
        this.allRoutes = Object.assign(this.allRoutes, newRoutes);

        // Update the multimethod.
        this.mm = new BinaryMultimethod({
            rules: this.allRoutes,
            timing: 'mixed',
            toDiscriminant: (req) => `${req.method} ${url.parse(req.url).pathname || ''}`
        });
    }

    private mm: BinaryMultimethod<express.Request, express.Response, false | void | Promise<false | void>>;

    private allRoutes: {[pattern: string]: Handler};
}
interface MultimethodsMiddleware {
    (req: express.Request, res: express.Response, next: express.NextFunction): false | void | Promise<false | void>;
}
export default MultimethodsMiddleware;
