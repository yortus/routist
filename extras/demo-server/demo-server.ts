import * as path from 'path';
import {HttpServer, staticFile, staticFiles, meta} from 'routist';
import {Request, Response} from 'express';
declare module 'express' {
    interface Request {
        session: any;
    }
}





class RouteTable extends HttpServer {

// TODO: implement equivalents for these:
    // Catchall metarules - these will run *before* all others.
    // NB: CONFUSING BUT CORRECT!!! Least-specific meta rule (1c) executes first, then 1b, ..., and finally most-specific 1a.
    // @deny('*')
    // '{METHOD} {...path} #1c' = logRequest(); // TODO: get rid of this too - build it in
    // '{METHOD} {...path} #1b' = servePublicAssets(); // TODO: get rid of this too? Special case for public assets...
    // '{METHOD} {...path} #1a' = ensureAuthorisedUser(); // TODO: this will go away - replaced with permissions system

    // Catchall fallback rules - these will run *after* all others.
    // As fallback, respond with index.html to serve the SPA at any (non-json) route.
    // '{METHOD} ... #2'  = staticFile(`${appRootPath}/dist/client/index.html`);
    // '{METHOD} ....json'= notFound(); // Effectively an exception to the previous catchall rule

    // Log all incoming requests
    '{...url}' = meta((req, res, {url}, next) => {
        console.log(`INCOMING: ${url}`);
        return next(req, res);
    });

    // Server static files at /public
    'GET /public' = staticFile(path.join(__dirname, '../../../extras/demo-server/static-files/index.html'));
    'GET /public/{...path}' = staticFiles(path.join(__dirname, '../../../extras/demo-server/static-files'));

    // HACK: set session.user from the querystring
    '{METHOD} {...url}' = meta((req, res, {}, next) => {
        let user = req.query.u;
        if (user) req.session.user = user;
        if (user === '') req.session.user = null;
        return next(req, res);
    });

    'GET /whoami*' = (req: Request, res: Response) => {
        res.send({user: req.session.user || 'GUEST'});
    }
}
let server = new HttpServer({});
server.add(new RouteTable);
server.start();





// // TODO: temp testing...
// interface Clearance {
//     clearanceMask: string;
//     intentionMask: string;
//     allow: boolean;
// }

// // export function routeTable(classCtor: Function) {
// //     console.log(`ROUTE TABLE CLEARANCES for '${classCtor.name}':`);
// //     console.log(classCtor.prototype._clearances);
// // }

// export function allow(clearanceMask: string) {
//     return (classProto: any, propertyKey: string) => {
//         let permissions: Clearance[] = classProto[permissionsTag] || (classProto[permissionsTag] = []);
//         permissions.push({
//             clearanceMask,
//             intentionMask: propertyKey,
//             allow: true
//         });
//     }
// }
// export function deny(clearanceMask: string) {
//     return (classProto: any, propertyKey: string) => {
//         let permissions: Clearance[] = classProto[permissionsTag] || (classProto[permissionsTag] = []);
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
