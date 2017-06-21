import {HttpServer, appData} from 'routist';





// TODO: move to st2/server...
// import {meta} from 'st2/server/http-server';
// function ensureAuthorisedUser() {
//     return meta((req, res, _captures: any, next) => {

//         // TODO: ...
//         let pathname = url.parse(req.url).pathname || '';
//         let isPublicRoute = /^\/account($|\/)/.test(pathname);
//         if (isPublicRoute) return next(req, res);

//         // TODO: use permissions! This is just black/white currently...
//         let session = (<any>req).session; // TODO: fix types!
//         let isLoggedIn = session && session.username;
//         if (isLoggedIn) return next(req, res);

//         // If we get here, request is NOT AUTHORISED.
//         let hasExtension = /\.[a-z]+$/i.test(pathname);
//         let hasJsonExtension = /\.json$/i.test(pathname);
//         if (hasExtension) {
//             // Fail with 401 unauthorised / 404 not found.
//             res.sendStatus(hasJsonExtension ? 401 : 404);
//         }
//         else {
//             // Redirect to login page.
//             res.redirect(`/account/login?then=${encodeURIComponent(req.url)}`);
//         }
//     });
// }
// function logRequest() {
//     return meta((req, res, _captures: any, next) => {
//         console.log(`REQUEST from ${req.ip} for resource ${req.url}`);
//         return next(req, res);
//     });
// }
// function servePublicAssets() {
//     const handler = staticFiles(`${appRootPath}/dist/client`);
//     return meta(async (req, res, captures, next) => {
//         let result = await handler(req, res, captures);
//         return result === false ? await next(req, res) : result;
//     });
// }





// TODO: temp testing... specifying permissions...
// const ALLOW_ALL = 1, ALLOW_NONE = 1.1, DENY_ALL = 0, DENY_NONE = 0.1;
// declare function allow(...args: string[]);
// declare function deny(...args: string[]);
// ({
//     '{METHOD} ...': DENY_ALL,
//     '{METHOD} /account/...': DENY_NONE,
//     '{METHOD} /leave/{id}': [],
//     '{METHOD} /my/details': [],
//     '{METHOD} /my/bank-accounts/{id}': [],
//     '{METHOD} /sync': [],
// });





class RouteTable {

    // Catchall metarules - these will run *before* all others.
    // NB: CONFUSING BUT CORRECT!!! Least-specific meta rule (1c) executes first, then 1b, ..., and finally most-specific 1a.
    // @deny('*')
    // '{METHOD} {...path} #1c' = logRequest(); // TODO: get rid of this too - build it in
    // '{METHOD} {...path} #1b' = servePublicAssets(); // TODO: get rid of this too? Special case for public assets...
    // '{METHOD} {...path} #1a' = ensureAuthorisedUser(); // TODO: this will go away - replaced with permissions system

    // Catchall fallback rules - these will run *after* all others.
    // As fallback, respond with index.html to serve the SPA at any (non-json) route.
//    '{METHOD} ... #2'  = staticFile(`${appRootPath}/dist/client/index.html`);
//    '{METHOD} ....json'= notFound(); // Effectively an exception to the previous catchall rule

    // Account management routes...
    'GET /account/{funcName}.json' = appData(({username}, {method}) => ({method, username}), 'account');

    // Account management HTTP API...
//    'POST /account/{funcName}'= httpApi(EssAccountManagement);

    // TODO: Test path...
    'GET /test.json' = appData(() => ({size: '200px'}), 'lorem-ipsum'); // TODO: stringly typed 'lorem-ipsum'

    // TODO: Home page test...
    'GET /.json' = appData(() => ({}), 'lorem-ipsum'); // TODO: stringly typed 'lorem-ipsum'

    // TODO: emps test
//    @allow.iff(/* user is emp with id empId */)
    'GET /employees{empId}.json' = appData(({empId}) => ({employeeId: empId}));
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
