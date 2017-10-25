// import './demo-server';
// import {allow, deny, MessagePredicate} from './vnext/access-control';
// import {User} from './vnext/core-types';
// import {error, json, makeMessageServer, MessageHandler} from './vnext/dispatch';
import * as app from './vnext/express-application';
// import {allow, ALWAYS, createRouteTable, NEVER, updateSession} from './vnext/express-middleware';

import {Routist} from './vnext/api';
import createDispatchTable = Routist.createDispatchTable;
import Handler = Routist.Handler;
import allow = Routist.AccessControlAPI.allow;
import AccessPredicate = Routist.AccessControlAPI.AccessPredicate;





// ================================================================================
// Application State
// ================================================================================
const CEO = 'bob';
let users = ['amy', 'bob', 'cal', 'dan'];
// let managers = {} as {[user: string]: User};

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
let dispatchTable = createDispatchTable();
let {queries, actions} = dispatchTable;
app.use(dispatchTable);
app.start();

// Lock down all routes by default. These are redundant since this is the default behaviour anyway.
queries['**'] = allow.never;
actions['**'] = allow.never;

// Session maintenance (login/logout)
actions['/session'] = [
    allow.always,
    authenticate('usn', 'pwd'),
];
queries['/session'] = [
    allow.always,
    authenticate('usn', 'pwd'), // TODO: temp testing only - should not be on GET, only POST...
    async (req, res) => {
        res.send({username: req.user});
    },
];

// List all users (only for ceo)
queries['/users'] = [
    allow.when(req => req.user === CEO),
    async (_, res) => { res.send({users}); },
];

// Show details of given user (only if self or subordinate to logged in user)
queries['/users/{name}'] = [
    allow.when(userEqualsUserInField('name')).or(userIsSuperiorToUserInField('name')),
//     json(msg => ({user: msg.arguments.name || 'GUEST', boss: managers[msg.arguments.name as string]})),
];

// // List users assigned to given boss (only for managers; boss must be subordinate to logged in user)
queries['/teams/{teamlead}'] = [
    allow.when(userIsInRole('managers')).and(userIsSuperiorToUserInField('teamlead')),
//     json((_, {boss}) => Object.keys(managers).filter(u => managers[u] === boss)),
];

// // Show details of logged in user (not allowed for GUEST)
// queries['/my/self'] = error('Not Implemented');

// // List users assigned to logged in user (only for managers)
// queries['/my/team'] = error('Not Implemented');

// // Create a new user and assign to logged in user (only for managers; user must not already exist)
// actions['create: /users'] = error('Not Implemented');

// // Delete the given user (only for managers; user must be subordinate to logged in user)
// actions['delete: /users'] = error('Not Implemented');

// // Re-assign the given user to the given boss (only for managers; user must be subordinate to logged in user)
// actions['assignto: /users/{name}'] = error('Not Implemented');

// TODO: temp testing...
queries['/favicon.ico'] = [
    allow.always,
    async () => { return; },
];





declare function userIsInRole(roleName: string): AccessPredicate;
declare function userEqualsUserInField(fieldName: string): AccessPredicate;
declare function userIsSuperiorToUserInField(fieldName: string): AccessPredicate;





// TODO: ...
function authenticate(usernameField = 'username', passwordField = 'password'): Handler {
    usernameField = usernameField;
    passwordField = passwordField;
    throw new Error(`Not implemented`);
}
