// tslint:disable:no-console
import {Request, Response} from 'express';
import {HttpServer, meta, Router, staticFile, staticFiles} from 'routist';
// TODO: temp testing...
const PERMISSIONS_TAG = '__perms';





// TODO: was... still needed?
declare module 'express' {
    // tslint:disable-next-line:no-shadowed-variable
    interface Request {
        session: any;
    }
}





class RouteTable extends Router {

// TODO: implement equivalents for these:
    // Catchall metarules - these will run *before* all others.
    // NB: Least-specific meta rule (1c) executes first, then 1b, ..., and finally most-specific 1a.
    // @deny('*')
    // '{METHOD} {...path} #1c' = logRequest(); // TODO: get rid of this too - build it in
    // '{METHOD} {...path} #1b' = servePublicAssets(); // TODO: get rid of this too? Special case for public assets...
    // '{METHOD} {...path} #1a' = ensureAuthorisedUser(); // TODO: this will go away - replaced with permissions system

    // Catchall fallback rules - these will run *after* all others.
    // As fallback, respond with index.html to serve the SPA at any (non-json) route.
    // '{METHOD} ... #2'  = staticFile(`${appRootPath}/dist/client/index.html`);
    // '{METHOD} ....json'= notFound(); // Effectively an exception to the previous catchall rule

    // Log all incoming requests
    '{**url}' = meta((req, res, {url}, next) => {
        console.log(`INCOMING: ${url}`);
        return next(req, res);
    });

    // Server static files at /public
    @allow('ALL')
    'GET /public' = staticFile('../../../extras/demo-server/static-files/index.html');

    @allow('ALL')
    'GET /public/{**path}' = staticFiles('../../../extras/demo-server/static-files');

    // HACK: set session.user from the querystring
    '{METHOD} {**url}' = meta((req, res, {}, next) => {
        let user = req.query.u;
        if (user) req.session.user = user;
        if (user === '') req.session.user = null;
        return next(req, res);
    });

    'GET /whoami*' = (req: Request, res: Response) => {
        res.send({user: req.session.user || 'GUEST'});
    }
}





let server = new HttpServer();
server.router = new RouteTable();
server.start();
console.log(`ROUTE TABLE CLEARANCES for '${RouteTable.name}':`);
console.log((RouteTable.prototype as any)._clearances);





// TODO: temp testing...
interface Clearance {
    clearanceMask: string;
    intentionMask: string;
    allow: boolean;
}

// // export function routeTable(classCtor: Function) {
// //     console.log(`ROUTE TABLE CLEARANCES for '${classCtor.name}':`);
// //     console.log(classCtor.prototype._clearances);
// // }




function allow(clearanceMask: string) {
    return (classProto: any, propertyKey: string) => {
        let permissions: Clearance[] = classProto[PERMISSIONS_TAG] || (classProto[PERMISSIONS_TAG] = []);
        permissions.push({
            clearanceMask,
            intentionMask: propertyKey,
            allow: true,
        });
    };
}
// export function deny(clearanceMask: string) {
//     return (classProto: any, propertyKey: string) => {
//         let permissions: Clearance[] = classProto[PERMISSIONS_TAG] || (classProto[PERMISSIONS_TAG] = []);
//         permissions.push({
//             clearanceMask,
//             intentionMask: propertyKey,
//             allow: false
//         });
//     }
// }
// export namespace allow {
//     export function iff() {
//         return (_classProto: any, _propertyKey: string) => {
//         }
//     }
// }





// @routeTable class MyClass {
//     @allow('/u/*')
//     '{METHOD} {...path} #1': string;

//     @allow('/u/*') @deny('/u/bob')
//     '{METHOD} {...path} #2': string;
// }
// MyClass
