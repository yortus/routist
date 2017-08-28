// tslint:disable:no-console
import {allow, deny, HttpServer, Message, meta, RouteTable, staticFile, staticFiles} from 'routist';





class DemoRoutes extends RouteTable {

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
    @allow('*')
    'GET /public' = staticFile('../../../extras/demo-server/static-files/index.html');

    @allow('*')
    'GET /public/{**path}' = staticFiles('../../../extras/demo-server/static-files');

    // HACK: set session.user from the querystring
    '{METHOD} {**url}' = meta((msg, {}, next) => {
        let user = msg.request.query.u;
        msg.roles = user ? ['@' + user] : [];
        return next(msg);
    });

    @deny('*')
    @allow('it manager')
    @deny('admin')
    @allow('@joe')
    'GET /whoami*' = (msg: Message) => {
        msg.response.send({user: msg.roles.length === 1 ? msg.roles[0] : 'GUEST/ERROR'});
    }
}





let server = new HttpServer({
    port: 8080,
    allRoles: {
        '@bob':     ['it', 'manager'],
        '@joe':     ['it', 'staff'],
        '@mary':    ['hr'],
        'manager':  ['admin'],
        'hr':       ['admin'],
        'it':       [],
        'admin':    [],
    },
});
server.updateRouteTable(new DemoRoutes());
// TODO: server.updateAccessControl() // invalidate cached roles, also optionally pass new AccessControlOptions
server.start();
