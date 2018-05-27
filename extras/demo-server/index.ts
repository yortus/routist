import {createRouter, deny, grant, GUEST, Request, Response, RuleQualifier, user} from 'routist';
import {start, staticFile, staticFiles} from 'routist';
import authenticate from './authenticate';





// TODO: temp testing...
const reply = {
    json(vOrF: {} | ((req: Request) => {})) {
        return (req: Request, res: Response) => {
            let v = vOrF;
            if (typeof v === 'function') {
                v = v(req);
            }
            res.json(v);
        };
    },
    error(msg: string) {
        return () => {
            throw new Error(msg);
        };
    },
};





// ================================================================================
// Application State
// ================================================================================
const CEO = 'bob';
let users = ['amy', 'bob', 'cal', 'dan'];
let managers = {} as {[user: string]: string};
managers = {
    amy: 'bob',
    bob: '',
    cal: 'bob',
    dan: 'bob',
};





// ================================================================================
// Demo Code
// ================================================================================
let app = createRouter();
start(app, 8080);
// setTimeout(() => stop(app), 5000); // TODO: temp testing...





app.refineAccess({
    'GET /favicon.ico':     grant.access,

    // TODO: temp testing...
    'GET /fields**':        grant.access,

    '**':                   deny.access, // TODO: ultimate fallback... not needed since default fallback is DENIED
    'GET /public**':        grant.access,
    '{ANY} /session':       grant.access,
    'GET /users':           grant.access.when(user.is(CEO)),
    'GET /users/{name}':    grant.access.when(user.is({param: 'name'})).or(userIsSuperiorTo({param: 'name'})),
    'GET /teams/{mngr}':    grant.access.when(userIsInRole('managers')).and(userIsSuperiorTo({param: 'mngr'})),

    'POST /api/**':         grant.access.when(user.isLoggedIn),

    'TESTING 1':            usr => usr === 'bob' ? 'grant' : 'deny',
    'TESTING 2':            grant.access.when(usr => usr === 'bob'),
});





// TODO: temp testing... static file(s)...
// NB: since we don't copy static files to /dist, we have to navigate back to /extras
app.refineRoutes({
    'GET /favicon.ico':             staticFile(`../../../extras/demo-server/static-files/favicon.ico`),
    'GET /public|GET /public/':     staticFile('../../../extras/demo-server/static-files/index.html'),
    'GET /public/{**path}':         staticFiles('../../../extras/demo-server/static-files'),
    'GET /public{**path}':          reply.json(req => `Couldn't find static file '${req.fields.path}'`),
});


// TODO: temp testing...
app.refineRoutes({
    'GET /fields': reply.json(req => req.fields),
    'GET /fields/{name}': reply.json(req => req.fields),
    'GET /fields/{**path}': reply.json(req => req.fields),

    // Session maintenance (login/logout)
    'GET /session': reply.json(req => ({
        isLoggedIn: req.user !== GUEST,
        username: req.user !== GUEST ? req.user : '',
    })),
    'POST /session': authenticate('usn', 'pwd'),

    // List all users (only for ceo)
    'GET /users': reply.json({users}),

    // Show details of given user (only if self or subordinate to logged in user)
    'GET /users/{name}': reply.json(req => ({
        user: req.fields.name || 'GUEST',
        boss: managers[req.fields.name as string],
    })),

    // // List users assigned to given boss (only for managers; boss must be subordinate to logged in user)
    'GET /teams/{teamlead}': reply.json(req => Object.keys(managers)
                                                     .filter(u => managers[u] === req.fields.teamlead)),

    // Show details of logged in user (not allowed for GUEST)
    'GET /my/self': reply.error('Not Implemented'),

    // List users assigned to logged in user (only for managers)
    'GET /my/team': reply.error('Not Implemented'),

    // Create a new user and assign to logged in user (only for managers; user must not already exist)
    'create: /users': reply.error('Not Implemented'),

    // Delete the given user (only for managers; user must be subordinate to logged in user)
    'DELETE /users': reply.error('Not Implemented'),

    // Re-assign the given user to the given boss (only for managers; user must be subordinate to logged in user)
    'assignto: /users/{name}': reply.error('Not Implemented'),
});



function userIsInRole(roleName: string) {
    let result: RuleQualifier = (usr, ctx) => {
        if (roleName !== 'managers') return false;
        if (user.isGuest(usr, ctx)) return false;
        return Object.values(managers).includes(usr as any);
    };
    return result;
}

function userIsSuperiorTo(comparandUser: {param: string}) {
    let result: RuleQualifier = (usr, ctx) => {
        let teamleadUser = ctx.params[comparandUser.param] as string || '';

        // TODO: include self for now...
        if (teamleadUser === usr) return true;

        // TODO: check should be recursive...
        return (managers[teamleadUser] || '') === usr;
    };
    return result;
}
