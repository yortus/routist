// tslint:disable:no-console
import {allow, deny, HttpServer, Message, meta, Router, staticFile, staticFiles} from 'routist';





// // TODO: was... still needed?
// declare module 'express' {
//     // tslint:disable-next-line:no-shadowed-variable
//     interface Request {
//         session: any;
//     }
// }





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
    '{**url}' = meta((msg, {url}, next) => {
        console.log(`INCOMING: ${url}`);
        return next(msg);
    });

    // Server static files at /public
    @allow('@all')
    'GET /public' = staticFile('../../../extras/demo-server/static-files/index.html');

    @allow('@all')
    'GET /public/{**path}' = staticFiles('../../../extras/demo-server/static-files');

    // HACK: set session.user from the querystring
    '{METHOD} {**url}' = meta((msg, {}, next) => {
        let user = msg.request.query.u;
        if (user) msg.user = user;
        if (user === '') msg.user = null;
        return next(msg);
    });

    @deny('@all')
    @allow('it managers')
    @deny('admin')
    @allow('@joe')
    'GET /whoami*' = (msg: Message) => {
        msg.response.send({user: msg.user || 'GUEST'});
    }
}





let server = new HttpServer();
server.router = new RouteTable();
server.start();
