// import './demo-server';
// import {allow, deny, MessagePredicate} from './vnext/access-control';
// import {User} from './vnext/core-types';
// import {error, json, makeMessageServer, MessageHandler} from './vnext/dispatch';
// import {allow, ALWAYS, createRouteTable, NEVER, updateSession} from './vnext/express-middleware';

import {Request, Response} from 'express';
import {createExpressApplication, deny, grant/*, AccessPredicate*/} from './vnext';
import debug from './vnext/debug';

//import {Routist} from './vnext/api';
//import Handler = Routist.Handler;
//import reply = Routist.reply;

// TODO: temp testing...
const reply = {
    json(vOrF: {} | ((req: Request) => {})) {
        return (req: Request, res: Response) => {
            let v = vOrF;
            if (typeof v === 'function') {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
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
//const CEO = 'bob';
let users = ['amy', 'bob', 'cal', 'dan'];
let managers = {} as {[user: string]: string};

// ceo = 'bob';
// managers = {
//     amy: 'bob',
//     bob: '',
//     cal: 'bob',
//     dan: 'bob',
// };





// ================================================================================
// Demo Code
// ================================================================================
let app = createExpressApplication();
app.listen(8080);
debug(`app listening on port 8080`);


app.refine.access({

    // TODO: temp testing...
    'GET /fields**':            grant.access,

    '**':                       deny.access, // fallback (redundant since this is default)
    '{ANY} /session':           grant.access,
//    'GET /users':               grant.access.when(req => req.user === CEO),
//    'GET /users/{name}':        grant.access.when(userEqualsUserInField('name')).or(userIsSuperiorToUserInField('name')),
//    'GET /teams/{teamlead}':    grant.access.when(userIsInRole('managers')).and(userIsSuperiorToUserInField('teamlead')),
});

// TODO: temp testing...
app.routes['GET /fields'] = reply.json(req => req.fields);
app.routes['GET /fields/{name}'] = reply.json(req => req.fields);
app.routes['GET /fields/{**path}'] = reply.json(req => req.fields);

// Session maintenance (login/logout)
app.routes['POST /session'] = authenticate('usn', 'pwd').then(reply.json(42));

// TODO: temp testing only - should not be on GET, only POST...
app.routes['GET /session'] = authenticate('usn', 'pwd').then(reply.json(req => req.user));

// List all users (only for ceo)
app.routes['GET /users'] = reply.json({users});

// Show details of given user (only if self or subordinate to logged in user)
app.routes['GET /users/{name}'] = reply.json(req => ({
    user: req.fields.name || 'GUEST',
    boss: managers[req.fields.name as string],
}));

// // List users assigned to given boss (only for managers; boss must be subordinate to logged in user)
app.routes['GET /teams/{teamlead}'] = reply.json(req => Object.keys(managers)
                                                              .filter(u => managers[u] === req.fields.boss));

// Show details of logged in user (not allowed for GUEST)
app.routes['GET /my/self'] = reply.error('Not Implemented');

// List users assigned to logged in user (only for managers)
app.routes['GET /my/team'] = reply.error('Not Implemented');

// Create a new user and assign to logged in user (only for managers; user must not already exist)
app.routes['create: /users'] = reply.error('Not Implemented');

// Delete the given user (only for managers; user must be subordinate to logged in user)
app.routes['DELETE /users'] = reply.error('Not Implemented');

// Re-assign the given user to the given boss (only for managers; user must be subordinate to logged in user)
app.routes['assignto: /users/{name}'] = reply.error('Not Implemented');





//declare function userIsInRole(roleName: string): AccessPredicate;
//declare function userEqualsUserInField(fieldName: string): AccessPredicate;
//declare function userIsSuperiorToUserInField(fieldName: string): AccessPredicate;





// TODO: ...
function authenticate(usernameField = 'username', passwordField = 'password'): Authenticate {

    // TODO: implement...
    usernameField = usernameField;
    passwordField = passwordField;
//    throw new Error(`Not implemented`);

    return {
        then(v: Handler) { return v; },
    };


}
interface Authenticate {
    then(h: Handler): Handler;
}
type Handler = (req: Request, res: Response) => void | Promise<void>;
